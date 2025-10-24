import * as fs from 'fs';
import * as path from 'path';

// 知识库配置接口
export interface KnowledgeBaseConfig {
  version: string;
  name: string;
  description: string;
  lastUpdated: string;
  sections: Array<{
    id: string;
    name: string;
    file: string;
    description: string;
  }>;
}

// 知识库服务类
export class KnowledgeBaseService {
  private config: KnowledgeBaseConfig | null = null;
  private dataCache: Map<string, any> = new Map();
  private readonly basePath: string;

  constructor() {
    // 设置知识库基础路径
    this.basePath = path.join(__dirname, '../knowledgebase');
    this.loadConfig();
  }

  // 加载知识库配置
  private loadConfig(): void {
    try {
      const configPath = path.join(this.basePath, 'knowledgebase.json');
      const configData = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configData);
    } catch (error) {
      console.error('加载知识库配置失败:', error);
      this.config = null;
    }
  }

  // 获取知识库配置
  getConfig(): KnowledgeBaseConfig | null {
    return this.config;
  }

  // 加载指定部分的知识库数据
  async loadSection(sectionId: string): Promise<any | null> {
    // 检查缓存
    if (this.dataCache.has(sectionId)) {
      return this.dataCache.get(sectionId);
    }

    // 检查配置
    if (!this.config) {
      this.loadConfig();
      if (!this.config) return null;
    }

    // 查找对应部分
    const section = this.config.sections.find(s => s.id === sectionId);
    if (!section) {
      console.error(`未找到ID为${sectionId}的知识库部分`);
      return null;
    }

    try {
      const filePath = path.join(this.basePath, section.file);
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsedData = JSON.parse(data);
      
      // 缓存数据
      this.dataCache.set(sectionId, parsedData);
      return parsedData;
    } catch (error) {
      console.error(`加载知识库部分${sectionId}失败:`, error);
      return null;
    }
  }

  // 加载所有知识库数据
  async loadAllSections(): Promise<Map<string, any>> {
    const result = new Map<string, any>();
    
    if (!this.config) {
      this.loadConfig();
      if (!this.config) return result;
    }

    for (const section of this.config.sections) {
      const data = await this.loadSection(section.id);
      if (data) {
        result.set(section.id, data);
      }
    }

    return result;
  }

  // 获取高考政策数据
  async getPolicyData(): Promise<any | null> {
    return this.loadSection('policy');
  }

  // 获取地区信息数据
  async getRegionsData(): Promise<any | null> {
    return this.loadSection('regions');
  }

  // 获取学籍管理数据
  async getStudentStatusData(): Promise<any | null> {
    return this.loadSection('student_status');
  }

  // 获取体检标准数据
  async getMedicalExamData(): Promise<any | null> {
    return this.loadSection('medical_exam');
  }

  // 获取科类信息数据
  async getSubjectCategoriesData(): Promise<any | null> {
    return this.loadSection('subject_categories');
  }

  // 获取专业目录数据
  async getMajorsData(): Promise<any | null> {
    return this.loadSection('majors');
  }

  // 获取院校信息数据
  async getUniversitiesData(): Promise<any | null> {
    return this.loadSection('universities');
  }

  // 获取志愿填报指导数据
  async getAdmissionGuideData(): Promise<any | null> {
    return this.loadSection('admission_guide');
  }

  // 获取职业规划指导数据
  async getCareerPlanningData(): Promise<any | null> {
    return this.loadSection('career_planning');
  }

  // 搜索知识库
  async search(query: string, sectionIds?: string[]): Promise<any[]> {
    const results: any[] = [];
    const sectionsToSearch = sectionIds || (this.config?.sections.map(s => s.id) || []);

    for (const sectionId of sectionsToSearch) {
      const sectionData = await this.loadSection(sectionId);
      if (sectionData) {
        const sectionResults = this.searchInObject(sectionData, query, sectionId);
        results.push(...sectionResults);
      }
    }

    return results;
  }

  // 在对象中搜索
  private searchInObject(obj: any, query: string, sectionId: string): any[] {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    const searchRecursive = (currentObj: any, path: string = '') => {
      if (!currentObj || typeof currentObj !== 'object') return;

      if (Array.isArray(currentObj)) {
        currentObj.forEach((item, index) => {
          searchRecursive(item, `${path}[${index}]`);
        });
      } else {
        for (const [key, value] of Object.entries(currentObj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
            results.push({
              sectionId,
              path: currentPath,
              key,
              value,
              context: this.extractContext(currentObj)
            });
          } else if (typeof value === 'object') {
            searchRecursive(value, currentPath);
          }
        }
      }
    };

    searchRecursive(obj);
    return results;
  }

  // 提取上下文信息
  private extractContext(obj: any): any {
    if (typeof obj !== 'object') return obj;
    
    // 简单处理：返回包含title和content的对象
    const context: any = {};
    if (obj.title) context.title = obj.title;
    if (obj.content) context.content = obj.content;
    if (obj.name) context.name = obj.name;
    if (obj.description) context.description = obj.description;
    
    return Object.keys(context).length > 0 ? context : obj;
  }

  // 清理缓存
  clearCache(): void {
    this.dataCache.clear();
  }
}

// 创建单例实例
export const knowledgeBaseService = new KnowledgeBaseService();