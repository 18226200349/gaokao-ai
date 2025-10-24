// 高考报名AI助手控制器
import gaokaoService from '../services/gaokaoService'
import { Response } from 'express';
import ExcelJS from 'exceljs';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import logger from '../../logger';
import getAi from '../services/getAi';

interface University {
  id: string;
  name: string;
  type: string;
  level: string;
  location: {
    province: string;
    city: string;
    district?: string;
    address?: string;
  };
  [key: string]: any;
}

const gaokaoController = {
  // 处理高考报名咨询请求
  consult: async function (req: any, res: any, next: any) {
    try {
      // 获取请求参数
      const { province, userInfo, interests } = req.body
      
      // 参数校验
      if (!province) {
        return res.json({
          code: 400,
          message: '缺少必要参数：province',
          data: null
        });
      }
      
      // 生成个性化报名方案
      const plan = gaokaoService.generatePersonalizedPlan(province, userInfo || {}, interests || []);
      
      // 返回结果
      res.json({
        code: 200,
        message: '操作成功',
        data: { 
          plan: plan,
          // 这里可以添加更多结构化数据
          provinceInfo: {
            name: province,
            registrationDeadline: '请参考方案中的报名时间'
          }
        }
      });
    } catch (error: any) {
      // 错误处理
      res.json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 导出Excel报名方案
  exportExcel: async function (req: any, res: any, next: any) {
    try {
      // 获取请求参数
      const { province, userInfo, interests } = req.body
      
      // 参数校验
      if (!province) {
        return res.status(400).json({
          code: 400,
          message: '缺少必要参数：province',
          data: null
        });
      }
      
      // 生成Excel文件
      const buffer = await gaokaoService.generateExcelPlan(province, userInfo || {}, interests || []);
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="gaokao-plan.xlsx"`);
      
      // 发送Excel文件
      res.send(buffer);
    } catch (error: any) {
      // 错误处理
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 获取省份列表
  getProvinces: async function (req: any, res: any, next: any) {
    try {
      // 在实际应用中，这些数据应该来自数据库
      const provinces = [
        { id: '北京', name: '北京市' },
        { id: '上海', name: '上海市' },
        { id: '广东', name: '广东省' },
        { id: '江苏', name: '江苏省' },
        { id: '浙江', name: '浙江省' }
      ];
      
      res.json({
        code: 200,
        message: '操作成功',
        data: { provinces }
      });
    } catch (error: any) {
      res.json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 解析上传的Excel文件并生成报名方案
  importExcel: async function (req: any, res: any, next: any) {
    try {
      // 检查是否有上传文件
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: '缺少上传文件',
          data: null
        });
      }

      // 解析Excel文件
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1);

      // 检查工作表是否存在
      if (!worksheet) {
        return res.status(400).json({
          code: 400,
          message: 'Excel文件格式错误，未找到工作表',
          data: null
        });
      }

      // 提取数据（假设第一行是标题行）
      const headers: string[] = [];
      const data: any[] = [];
      
      worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
        if (rowNumber === 1) {
          // 提取标题行
          row.eachCell((cell, colNumber) => {
            headers.push(cell.value?.toString() || '');
          });
        } else {
          // 提取数据行
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          data.push(rowData);
        }
      });

      // 从Excel数据中提取必要信息（假设只处理第一行数据）
      if (data.length === 0) {
        return res.status(400).json({
          code: 400,
          message: 'Excel文件中没有找到数据',
          data: null
        });
      }
      
      const firstRowData = data[0];
      const province = firstRowData['省份'] || firstRowData['province'];
      const userInfo = {
        name: firstRowData['姓名'] || firstRowData['name'],
        province: firstRowData['省份'] || firstRowData['province'],
        subject: firstRowData['科类'] || firstRowData['subject'],
        score: firstRowData['成绩'] || firstRowData['score']
      };
      const interests: string[] = [];

      // 参数校验
      if (!province) {
        return res.status(400).json({
          code: 400,
          message: 'Excel文件中缺少必要信息：省份',
          data: null
        });
      }

      // 生成个性化报名方案
      const plan = gaokaoService.generatePersonalizedPlan(province, userInfo, interests);

      // 返回结果
      res.json({
        code: 200,
        message: '操作成功',
        data: { 
          plan: plan,
          provinceInfo: {
            name: province,
            registrationDeadline: '请参考方案中的报名时间'
          }
        }
      });
    } catch (error: any) {
      // 错误处理
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 高考专用聊天接口
  chat: async function (req: any, res: any, next: any) {
    try {
      const { message, province } = req.body;
      
      // 参数校验
      if (!message) {
        return res.json({
          code: 400,
          success: false,
          message: '缺少必要参数：message',
          data: null
        });
      }
      
      // 这里可以调用AI服务，针对高考相关问题进行专门处理
      // 暂时返回一个模拟响应
      const reply = `关于高考的问题："${message}"，我建议你${province ? `在${province}` : ''}可以考虑以下几个方面：
1. 了解当地的高考政策和报名要求
2. 根据自己的兴趣和成绩选择合适的专业
3. 提前准备相关的报名材料
4. 关注重要的时间节点

如需更详细的个性化建议，请使用我们的高考咨询功能。`;
      
      res.json({
        code: 200,
        success: true,
        message: '操作成功',
        data: {
          reply: reply,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.json({
        code: 500,
        success: false,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // AI生成排名最高的10所学校
  getTopUniversitiesByAI: async function (req: any, res: any, next: any) {
    try {
      const { keyword, level, location } = req.query;
      
      logger.info('AI生成排名最高的学校', { keyword, level, location });
      
      // 参数校验
      if (!keyword) {
        return res.json({
          code: 400,
          message: '缺少必要参数：keyword（院校关键词）',
          data: null
        });
      }
      
      // 从知识库获取大学数据
      const universitiesData = await knowledgeBaseService.getUniversitiesData();
      const universities: University[] = universitiesData?.universities || [];
      
      // 初步筛选匹配的大学
      let matchedUniversities = universities.filter(u => {
        const keywordLower = (keyword as string).toLowerCase();
        const nameMatch = u.name.toLowerCase().includes(keywordLower);
        const levelMatch = !level || (u.level && u.level.includes(level as string));
        const locationMatch = !location || 
          u.location.province.includes(location as string) || 
          u.location.city.includes(location as string) ||
          (location as string).includes(u.location.province) ||
          (location as string).includes(u.location.city);
        return nameMatch && levelMatch && locationMatch;
      });
      
      // 如果没有找到匹配的大学，尝试更宽松的匹配
      if (matchedUniversities.length === 0) {
        matchedUniversities = universities.filter(u => {
          const keywordLower = (keyword as string).toLowerCase();
          return u.name.toLowerCase().includes(keywordLower) ||
                 u.location.province.toLowerCase().includes(keywordLower) ||
                 u.location.city.toLowerCase().includes(keywordLower) ||
                 (u.type && u.type.toLowerCase().includes(keywordLower));
        });
      }
      
      // 按排名排序（优先考虑全国排名）
      matchedUniversities.sort((a, b) => {
        const rankA = a.ranking?.national || 9999;
        const rankB = b.ranking?.national || 9999;
        return rankA - rankB;
      });
      
      // 取前10所
      const top10Universities = matchedUniversities.slice(0, 10);
      
      // 构建AI分析的上下文
      let context = `作为高考志愿填报专家，请根据以下院校信息，分析并推荐排名最高的10所学校。\n\n`;
      context += `用户搜索关键词：${keyword}\n`;
      if (level) context += `层次要求：${level}\n`;
      if (location) context += `地区要求：${location}\n\n`;
      
      context += `匹配到的院校列表（已按全国排名排序）：\n`;
      top10Universities.forEach((u, index) => {
        context += `${index + 1}. ${u.name}\n`;
        context += `   - 层次：${u.level || '未知'}\n`;
        context += `   - 地区：${u.location.province} ${u.location.city}\n`;
        context += `   - 类型：${u.type || '未知'}\n`;
        context += `   - 全国排名：${u.ranking?.national || '未排名'}\n`;
        if (u.ranking?.qs_world) context += `   - QS世界排名：${u.ranking.qs_world}\n`;
        if (u.key_disciplines?.length > 0) {
          context += `   - 重点学科：${u.key_disciplines.slice(0, 3).join('、')}等\n`;
        }
        context += `\n`;
      });
      
      context += `请对这些院校进行简要分析，包括：\n`;
      context += `1. 这些院校的综合实力和特色\n`;
      context += `2. 推荐理由（为什么这些学校排名靠前）\n`;
      context += `3. 选择建议（适合什么样的考生）\n\n`;
      context += `请用简洁专业的语言回答，重点突出每所学校的优势。`;
      
      // 调用AI生成分析报告
      const aiAnalysis = await getAi.chat(context);
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          universities: top10Universities,
          total: top10Universities.length,
          aiAnalysis: aiAnalysis,
          searchInfo: {
            keyword,
            level: level || null,
            location: location || null,
            totalMatched: matchedUniversities.length
          }
        }
      });
    } catch (error: any) {
      logger.error('AI生成排名最高的学校失败', error);
      res.json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 获取大学列表
  getUniversities: async function (req: any, res: any, next: any) {
    try {
      const { level, location, keyword, province, minScore, maxScore } = req.query;
      
      logger.info('获取大学列表', { level, location, keyword, province, minScore, maxScore });
      
      // 从知识库获取大学数据
      const universitiesData = await knowledgeBaseService.getUniversitiesData();
      const universities: University[] = universitiesData?.universities || [];
      
      // 过滤数据
      let filteredUniversities = universities;
      
      // 按level过滤（支持模糊匹配，如985、211、双一流）
      if (level) {
        filteredUniversities = filteredUniversities.filter(u => 
          u.level && u.level.includes(level)
        );
      }
      
      // 按location过滤（支持模糊匹配）
      if (location) {
        filteredUniversities = filteredUniversities.filter(u => 
          u.location.province.includes(location) || 
          u.location.city.includes(location) ||
          location.includes(u.location.province) ||
          location.includes(u.location.city)
        );
      }
      
      // 按keyword过滤
      if (keyword) {
        const keywordLower = String(keyword).toLowerCase();
        filteredUniversities = filteredUniversities.filter(u => 
          u.name.toLowerCase().includes(keywordLower) ||
          (u.abbreviation && u.abbreviation.toLowerCase().includes(keywordLower)) ||
          u.location.province.toLowerCase().includes(keywordLower) ||
          u.location.city.toLowerCase().includes(keywordLower)
        );
      }
      
      // 按省份的分数线过滤
      if (province && (minScore || maxScore)) {
        filteredUniversities = filteredUniversities.filter(u => {
          if (!u.admission_info || !u.admission_info['2024_cutoff_scores']) {
            return false;
          }
          
          const provinceScores = u.admission_info['2024_cutoff_scores'][province];
          if (!provinceScores) {
            return false;
          }
          
          // 获取该省的最高分数（理科/文科/物理/历史/综合）
          const scores = Object.values(provinceScores).filter((s): s is number => typeof s === 'number');
          if (scores.length === 0) {
            return false;
          }
          
          const maxProvinceScore = Math.max(...scores);
          
          if (minScore && maxProvinceScore < Number(minScore)) {
            return false;
          }
          if (maxScore && maxProvinceScore > Number(maxScore)) {
            return false;
          }
          
          return true;
        });
      }
      
      // 格式化返回数据，添加更多展示信息
      const formattedUniversities = filteredUniversities.map(u => ({
        id: u.id,
        name: u.name,
        location: `${u.location.province} ${u.location.city}`,
        type: u.type,
        level: u.level,
        score: province && u.admission_info && u.admission_info['2024_cutoff_scores'] && u.admission_info['2024_cutoff_scores'][province]
          ? Math.max(...Object.values(u.admission_info['2024_cutoff_scores'][province]).filter((s): s is number => typeof s === 'number'))
          : null,
        ranking: u.ranking ? u.ranking.national : null,
        website: u.website,
        keyDisciplines: u.key_disciplines ? u.key_disciplines.slice(0, 5) : [],
        admissionRate: u.admission_info ? u.admission_info.admission_rate : null
      }));
      
      res.json({
        success: true,
        code: 200,
        message: '操作成功',
        data: formattedUniversities,
        total: formattedUniversities.length
      });
    } catch (error: any) {
      logger.error('获取大学列表失败', error);
      res.json({
        success: false,
        code: 500,
        message: '服务器内部错误',
        data: [],
        error: error.message
      });
    }
  },
  
  // 获取专业列表
  getMajors: async function (req: any, res: any, next: any) {
    try {
      const { keyword, category, level } = req.query;
      
      logger.info('获取专业列表', { keyword, category, level });
      
      // 从知识库获取专业数据
      const majorsData = await knowledgeBaseService.getMajorsData();
      const majors = majorsData?.majors || [];
      
      // 过滤数据
      let filteredMajors = majors;
      
      // 按关键词过滤
      if (keyword) {
        const keywordLower = String(keyword).toLowerCase();
        filteredMajors = filteredMajors.filter((m: any) => 
          m.name.toLowerCase().includes(keywordLower) ||
          (m.description && m.description.toLowerCase().includes(keywordLower)) ||
          (m.category && m.category.toLowerCase().includes(keywordLower))
        );
      }
      
      // 按专业类别过滤
      if (category) {
        filteredMajors = filteredMajors.filter((m: any) => 
          m.category === category || m.major_category === category
        );
      }
      
      // 按学历层次过滤
      if (level) {
        filteredMajors = filteredMajors.filter((m: any) => 
          m.degree_type === level || (m.degree_types && m.degree_types.includes(level))
        );
      }
      
      // 格式化返回数据
      const formattedMajors = filteredMajors.map((m: any) => ({
        id: m.id,
        name: m.name,
        code: m.code,
        category: m.category || m.major_category,
        type: m.degree_type || '本科',
        level: m.degree_types ? m.degree_types.join('/') : '本科',
        description: m.description,
        employmentRate: m.employment_info ? m.employment_info.rate : null,
        averageSalary: m.employment_info ? m.employment_info.average_salary : null,
        topUniversities: m.top_universities ? m.top_universities.slice(0, 5) : []
      }));
      
      res.json({
        success: true,
        code: 200,
        message: '操作成功',
        data: formattedMajors,
        total: formattedMajors.length
      });
    } catch (error: any) {
      logger.error('获取专业列表失败', error);
      res.json({
        success: false,
        code: 500,
        message: '服务器内部错误',
        data: [],
        error: error.message
      });
    }
  }
}

export default gaokaoController