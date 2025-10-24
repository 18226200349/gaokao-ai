# 高考知识库使用指南

## 目录
1. [知识库概述](#知识库概述)
2. [知识库结构](#知识库结构)
3. [快速开始](#快速开始)
4. [集成步骤](#集成步骤)
5. [API使用示例](#api使用示例)
6. [服务方法详解](#服务方法详解)
7. [最佳实践](#最佳实践)
8. [常见问题](#常见问题)

---

## 知识库概述

高考知识库系统是一个基于JSON文档存储的结构化知识管理系统，包含以下9个主要知识库：

- **政策库** (`policy.json`) - 国家及各地高考政策
- **地区库** (`regions.json`) - 各省市地区信息及高考数据
- **学籍库** (`student_status.json`) - 学籍管理规定
- **体检库** (`medical_exam.json`) - 高考体检标准
- **科类库** (`subject_categories.json`) - 文理科及选科信息
- **专业库** (`majors.json`) - 大学专业目录及详情
- **院校库** (`universities.json`) - 高校信息及排名
- **志愿填报库** (`admission_guide.json`) - 志愿填报策略指导
- **职业规划库** (`career_planning.json`) - 职业发展路径

---

## 知识库结构

```
src/
├── knowledgebase/              # 知识库文件目录
│   ├── knowledgebase.json      # 主配置文件
│   ├── policy.json             # 政策库
│   ├── regions.json            # 地区库
│   ├── student_status.json     # 学籍库
│   ├── medical_exam.json       # 体检库
│   ├── subject_categories.json # 科类库
│   ├── majors.json             # 专业库
│   ├── universities.json       # 院校库
│   ├── admission_guide.json    # 志愿填报库
│   └── career_planning.json    # 职业规划库
├── services/
│   └── knowledgeBaseService.ts # 知识库服务
├── controllers/
│   └── knowledgeBaseChat.ts    # 知识库聊天控制器（示例）
└── routes/
    └── knowledgeBaseRoutes.ts  # 知识库路由（示例）
```

---

## 快速开始

### 1. 导入知识库服务

```typescript
import knowledgeBaseService from '../services/knowledgeBaseService';
```

### 2. 基本使用示例

```typescript
// 获取政策数据
const policyData = await knowledgeBaseService.getPolicyData();

// 获取专业数据
const majorsData = await knowledgeBaseService.getMajorsData();

// 搜索知识库
const results = await knowledgeBaseService.search('北京高考政策');
```

---

## 集成步骤

### 步骤1：在现有控制器中集成

在 `src/controllers/chat.ts` 中集成知识库服务：

```typescript
import knowledgeBaseService from '../services/knowledgeBaseService';
import getAi from '../services/getAi';

const chatController = {
  chat: async function (req: any, res: any, next: any) {
    try {
      const question = req.body.question;
      const province = req.body.province || '北京';
      
      // 1. 从知识库搜索相关信息
      const searchResults = await knowledgeBaseService.search(question);
      
      // 2. 根据问题类型获取特定数据
      let contextInfo = '';
      
      if (question.includes('政策')) {
        const policyData = await knowledgeBaseService.getPolicyData();
        contextInfo += `政策信息：${JSON.stringify(policyData)}\n`;
      }
      
      if (question.includes('专业')) {
        const majorsData = await knowledgeBaseService.getMajorsData();
        contextInfo += `专业信息：${JSON.stringify(majorsData)}\n`;
      }
      
      // 3. 构建AI上下文
      const fullContext = `
        基于以下知识库信息回答用户问题：
        
        搜索结果：${JSON.stringify(searchResults)}
        
        ${contextInfo}
        
        用户问题：${question}
      `;
      
      // 4. 调用AI生成回答
      const reply = await getAi.chat(fullContext);
      
      res.json({
        code: 200,
        message: '操作成功',
        data: { reply }
      });
    } catch (error: any) {
      res.json({
        code: 500,
        message: error.message,
        data: null
      });
    }
  }
};

export default chatController;
```

### 步骤2：注册新的知识库路由（可选）

在 `src/app.ts` 中注册知识库路由：

```typescript
import knowledgeBaseRoutes from './routes/knowledgeBaseRoutes';

// 注册路由
app.use('/api', knowledgeBaseRoutes);
```

### 步骤3：在gaokaoService中集成（推荐）

修改 `src/services/gaokaoService.ts`，用知识库数据替换硬编码数据：

```typescript
import knowledgeBaseService from './knowledgeBaseService';

class GaokaoAssistant {
  // 解读政策 - 使用知识库数据
  async interpretPolicy(province: string): Promise<string> {
    const policyData = await knowledgeBaseService.getPolicyData();
    const regionsData = await knowledgeBaseService.getRegionsData();
    
    // 查找省份的高考政策
    const regionInfo = regionsData.regions.find((r: any) => r.name === province);
    
    if (!regionInfo) {
      return `暂未收录${province}的高考政策信息`;
    }
    
    return `
${province}高考政策:
报名时间: ${regionInfo.gaokao.registrationDate}
考试时间: ${regionInfo.gaokao.examDate}
考试模式: ${regionInfo.gaokao.examMode}
总分: ${regionInfo.gaokao.totalScore}分
录取率: ${regionInfo.gaokao.admissionRate}
    `.trim();
  }
  
  // 志愿匹配 - 使用知识库数据
  async matchMajors(interests: string[], province: string): Promise<object> {
    const majorsData = await knowledgeBaseService.getMajorsData();
    
    // 根据兴趣筛选专业
    const recommendations: any[] = [];
    
    majorsData.categories.forEach((category: any) => {
      category.majors.forEach((major: any) => {
        // 根据用户兴趣匹配专业
        recommendations.push({
          name: major.name,
          code: major.code,
          category: category.name,
          description: major.description,
          employmentRate: major.employmentRate,
          averageSalary: major.averageSalary
        });
      });
    });
    
    return {
      text: '为您推荐以下专业：',
      majors: recommendations.slice(0, 5)
    };
  }
}

export default new GaokaoAssistant();
```

---

## API使用示例

### 1. 知识库增强型聊天接口

**请求：**
```bash
curl -X POST http://localhost:3000/api/kb-chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "北京2025年高考什么时候报名？",
    "province": "北京"
  }'
```

**响应：**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "reply": "根据知识库信息，北京市2025年高考报名时间为2024年11月1日至10日...",
    "searchResultsCount": 3,
    "hasContextInfo": true
  }
}
```

### 2. 获取特定知识库数据

**请求：**
```bash
# 获取政策数据
curl http://localhost:3000/api/knowledge-base?type=policy

# 获取专业数据
curl http://localhost:3000/api/knowledge-base?type=majors

# 获取所有数据
curl http://localhost:3000/api/knowledge-base?type=all
```

**响应：**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "policy_2025",
    "name": "2025年高考政策",
    "nationalPolicies": [...],
    "regionalPolicies": [...]
  }
}
```

### 3. 搜索知识库

**请求：**
```bash
curl -X POST http://localhost:3000/api/kb-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "计算机专业",
    "maxResults": 5
  }'
```

**响应：**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "query": "计算机专业",
    "results": [
      {
        "section": "majors",
        "path": "categories[0].majors[0]",
        "content": {...}
      }
    ],
    "count": 5
  }
}
```

---

## 服务方法详解

### KnowledgeBaseService 类方法

#### 1. 数据加载方法

```typescript
// 获取政策数据
const policyData = await knowledgeBaseService.getPolicyData();

// 获取地区数据
const regionsData = await knowledgeBaseService.getRegionsData();

// 获取学籍数据
const studentStatusData = await knowledgeBaseService.getStudentStatusData();

// 获取体检数据
const medicalData = await knowledgeBaseService.getMedicalExamData();

// 获取科类数据
const subjectData = await knowledgeBaseService.getSubjectCategoriesData();

// 获取专业数据
const majorsData = await knowledgeBaseService.getMajorsData();

// 获取院校数据
const universitiesData = await knowledgeBaseService.getUniversitiesData();

// 获取志愿填报数据
const admissionData = await knowledgeBaseService.getAdmissionGuideData();

// 获取职业规划数据
const careerData = await knowledgeBaseService.getCareerPlanningData();

// 加载所有知识库数据
const allData = await knowledgeBaseService.loadAllSections();
```

#### 2. 搜索方法

```typescript
// 基本搜索
const results = await knowledgeBaseService.search('北京高考');

// 限制结果数量
const limitedResults = await knowledgeBaseService.search('专业', 5);

// 搜索结果格式
interface SearchResult {
  section: string;      // 所属知识库
  path: string;         // 数据路径
  content: any;         // 匹配内容
  context?: string;     // 上下文信息
}
```

#### 3. 缓存管理方法

```typescript
// 清除所有缓存
knowledgeBaseService.clearCache();

// 重新加载知识库配置
const config = await knowledgeBaseService.loadConfig();
```

---

## 最佳实践

### 1. 缓存策略

知识库服务内置了缓存机制，已加载的数据会被缓存。在以下情况下应清除缓存：

```typescript
// 知识库文件更新后
knowledgeBaseService.clearCache();

// 定期清理（如每天凌晨）
setInterval(() => {
  knowledgeBaseService.clearCache();
}, 24 * 60 * 60 * 1000);
```

### 2. 错误处理

```typescript
try {
  const data = await knowledgeBaseService.getPolicyData();
  // 处理数据
} catch (error) {
  console.error('加载知识库失败：', error);
  // 使用默认数据或返回错误信息
}
```

### 3. 按需加载

只加载需要的知识库部分，避免加载全部数据：

```typescript
// ✅ 推荐：按需加载
if (question.includes('政策')) {
  const policyData = await knowledgeBaseService.getPolicyData();
}

// ❌ 不推荐：加载全部数据
const allData = await knowledgeBaseService.loadAllSections();
```

### 4. 搜索优化

```typescript
// 使用具体的搜索关键词
const results1 = await knowledgeBaseService.search('北京高考报名时间'); // ✅ 好
const results2 = await knowledgeBaseService.search('高考'); // ❌ 太宽泛

// 限制搜索结果数量
const results = await knowledgeBaseService.search('专业', 10);
```

### 5. 与AI结合使用

```typescript
// 结合知识库和AI生成更准确的回答
const searchResults = await knowledgeBaseService.search(question);
const contextData = await knowledgeBaseService.getPolicyData();

const aiContext = `
基于以下知识库信息回答问题：

知识库搜索结果：
${JSON.stringify(searchResults, null, 2)}

详细政策信息：
${JSON.stringify(contextData, null, 2)}

用户问题：${question}

请提供准确、详细的回答。如果知识库中没有相关信息，请明确说明。
`;

const reply = await getAi.chat(aiContext);
```

---

## 常见问题

### Q1: 如何更新知识库数据？

**A:** 直接编辑对应的JSON文件，然后清除缓存：

```typescript
// 编辑 src/knowledgebase/policy.json 后
knowledgeBaseService.clearCache();
```

### Q2: 知识库文件过大怎么办？

**A:** 可以考虑：
1. 拆分大文件为多个小文件
2. 使用数据库存储（如MongoDB、PostgreSQL）
3. 实现分页加载机制

### Q3: 如何添加新的知识库？

**A:** 按以下步骤操作：

1. 在 `src/knowledgebase/` 创建新的JSON文件（如 `exams.json`）
2. 更新 `knowledgebase.json` 配置：

```json
{
  "parts": [
    ...,
    {
      "id": "exams",
      "name": "考试信息",
      "file": "exams.json",
      "description": "各类考试信息"
    }
  ]
}
```

3. 在 `knowledgeBaseService.ts` 添加获取方法：

```typescript
async getExamsData() {
  return this.loadSection('exams');
}
```

### Q4: 搜索结果不准确怎么办？

**A:** 可以：
1. 使用更具体的搜索关键词
2. 根据问题类型直接调用对应的数据获取方法
3. 改进搜索算法（如添加相关性评分）

### Q5: 如何在前端使用知识库？

**A:** 通过API接口调用：

```javascript
// 前端代码示例
async function askQuestion(question) {
  const response = await fetch('http://localhost:3000/api/kb-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: question,
      province: '北京'
    })
  });
  
  const data = await response.json();
  return data.data.reply;
}

// 使用
const answer = await askQuestion('北京高考什么时候报名？');
console.log(answer);
```

### Q6: 知识库服务的性能如何？

**A:** 性能特点：
- 首次加载：需要读取JSON文件（较慢）
- 后续访问：使用缓存（很快）
- 搜索性能：取决于数据量，建议限制结果数量

优化建议：
```typescript
// 预加载常用数据
await knowledgeBaseService.getPolicyData();
await knowledgeBaseService.getRegionsData();
```

---

## 完整使用示例

### 示例1：智能问答系统

```typescript
import knowledgeBaseService from '../services/knowledgeBaseService';
import getAi from '../services/getAi';

async function intelligentQA(question: string, province: string = '北京') {
  try {
    // 1. 分析问题类型
    const questionType = analyzeQuestionType(question);
    
    // 2. 获取相关知识库数据
    let knowledgeContext = '';
    
    switch (questionType) {
      case 'policy':
        const policyData = await knowledgeBaseService.getPolicyData();
        knowledgeContext = JSON.stringify(policyData);
        break;
      case 'major':
        const majorsData = await knowledgeBaseService.getMajorsData();
        knowledgeContext = JSON.stringify(majorsData);
        break;
      case 'university':
        const universitiesData = await knowledgeBaseService.getUniversitiesData();
        knowledgeContext = JSON.stringify(universitiesData);
        break;
      default:
        // 使用搜索
        const searchResults = await knowledgeBaseService.search(question, 5);
        knowledgeContext = JSON.stringify(searchResults);
    }
    
    // 3. 构建AI提示
    const prompt = `
作为高考咨询专家，基于以下知识库信息回答用户问题：

知识库信息：
${knowledgeContext}

用户问题：${question}
省份：${province}

要求：
1. 提供准确、详细的回答
2. 引用具体的政策或数据
3. 如果知识库中没有相关信息，明确告知
4. 使用友好、专业的语气
    `;
    
    // 4. 生成回答
    const answer = await getAi.chat(prompt);
    
    return {
      success: true,
      answer,
      questionType,
      hasKnowledgeBase: !!knowledgeContext
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

function analyzeQuestionType(question: string): string {
  if (question.includes('政策') || question.includes('报名') || question.includes('考试时间')) {
    return 'policy';
  }
  if (question.includes('专业') || question.includes('学科')) {
    return 'major';
  }
  if (question.includes('大学') || question.includes('院校')) {
    return 'university';
  }
  if (question.includes('志愿') || question.includes('填报')) {
    return 'admission';
  }
  if (question.includes('职业') || question.includes('就业')) {
    return 'career';
  }
  return 'general';
}

// 使用示例
const result = await intelligentQA('北京2025年高考什么时候报名？', '北京');
console.log(result.answer);
```

### 示例2：专业推荐系统

```typescript
import knowledgeBaseService from '../services/knowledgeBaseService';

async function recommendMajors(userProfile: {
  interests: string[],
  subjects: string[],
  careerGoal?: string,
  province: string
}) {
  try {
    // 1. 获取专业和职业规划数据
    const majorsData = await knowledgeBaseService.getMajorsData();
    const careerData = await knowledgeBaseService.getCareerPlanningData();
    
    // 2. 根据用户画像筛选专业
    const recommendations: any[] = [];
    
    majorsData.categories.forEach((category: any) => {
      category.majors.forEach((major: any) => {
        // 匹配选科要求
        const subjectMatch = major.subjectRequirements?.some(
          (req: string) => userProfile.subjects.includes(req)
        );
        
        if (subjectMatch) {
          recommendations.push({
            name: major.name,
            code: major.code,
            category: category.name,
            description: major.description,
            coreCourses: major.coreCourses,
            employmentRate: major.employmentRate,
            averageSalary: major.averageSalary,
            careerPaths: major.careerPaths,
            topUniversities: major.topUniversities
          });
        }
      });
    });
    
    // 3. 按就业率和薪资排序
    recommendations.sort((a, b) => {
      const scoreA = parseFloat(a.employmentRate) + a.averageSalary / 1000;
      const scoreB = parseFloat(b.employmentRate) + b.averageSalary / 1000;
      return scoreB - scoreA;
    });
    
    return {
      success: true,
      recommendations: recommendations.slice(0, 10),
      totalMatches: recommendations.length
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 使用示例
const result = await recommendMajors({
  interests: ['理工', '计算机'],
  subjects: ['物理', '化学', '数学'],
  careerGoal: 'IT行业',
  province: '北京'
});

console.log('推荐专业：', result.recommendations);
```

### 示例3：志愿填报助手

```typescript
import knowledgeBaseService from '../services/knowledgeBaseService';

async function volunteerAdmissionAssistant(userInfo: {
  score: number,
  province: string,
  ranking: number,
  subjects: string[],
  preferences: string[] // 专业偏好
}) {
  try {
    // 1. 获取相关数据
    const admissionData = await knowledgeBaseService.getAdmissionGuideData();
    const universitiesData = await knowledgeBaseService.getUniversitiesData();
    const regionsData = await knowledgeBaseService.getRegionsData();
    
    // 2. 找到用户所在省份信息
    const provinceInfo = regionsData.regions.find(
      (r: any) => r.name === userInfo.province
    );
    
    // 3. 根据分数和排名推荐院校
    const recommendations = universitiesData.universities
      .filter((uni: any) => {
        // 简化逻辑：根据历年录取分数线筛选
        const scoreRange = uni.admissionScores?.[userInfo.province];
        if (!scoreRange) return false;
        
        const minScore = scoreRange.min || 0;
        const maxScore = scoreRange.max || 750;
        
        return userInfo.score >= minScore - 20 && userInfo.score <= maxScore + 20;
      })
      .map((uni: any) => ({
        name: uni.name,
        type: uni.type,
        level: uni.level,
        location: uni.location,
        ranking: uni.ranking,
        keyDisciplines: uni.keyDisciplines,
        admissionProbability: calculateAdmissionProbability(
          userInfo.score,
          uni.admissionScores?.[userInfo.province]
        )
      }));
    
    // 4. 按录取概率分类：冲刺、稳妥、保底
    const categorized = {
      rush: recommendations.filter(r => r.admissionProbability < 30),
      stable: recommendations.filter(r => r.admissionProbability >= 30 && r.admissionProbability <= 70),
      safe: recommendations.filter(r => r.admissionProbability > 70)
    };
    
    // 5. 获取填报策略
    const strategies = admissionData.strategies;
    
    return {
      success: true,
      recommendations: categorized,
      strategies: strategies,
      advice: generateAdmissionAdvice(categorized, admissionData)
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

function calculateAdmissionProbability(userScore: number, scoreRange: any): number {
  if (!scoreRange) return 0;
  
  const min = scoreRange.min || 0;
  const max = scoreRange.max || 750;
  const avg = (min + max) / 2;
  
  if (userScore >= max) return 90;
  if (userScore >= avg) return 60;
  if (userScore >= min) return 30;
  return 10;
}

function generateAdmissionAdvice(categorized: any, admissionData: any): string {
  return `
志愿填报建议：

1. 冲刺院校（${categorized.rush.length}所）：
   ${categorized.rush.slice(0, 3).map((u: any) => u.name).join('、')}
   建议填报2-3所，录取概率约20-30%

2. 稳妥院校（${categorized.stable.length}所）：
   ${categorized.stable.slice(0, 5).map((u: any) => u.name).join('、')}
   建议填报5-8所，录取概率约50-70%

3. 保底院校（${categorized.safe.length}所）：
   ${categorized.safe.slice(0, 3).map((u: any) => u.name).join('、')}
   建议填报2-3所，录取概率约80%以上

填报策略：
${admissionData.strategies.map((s: any) => `- ${s.name}: ${s.description}`).join('\n')}

注意事项：
${admissionData.commonMistakes.map((m: any) => `- ${m.name}: ${m.description}`).join('\n')}
  `;
}

// 使用示例
const result = await volunteerAdmissionAssistant({
  score: 620,
  province: '北京',
  ranking: 5000,
  subjects: ['物理', '化学', '生物'],
  preferences: ['计算机', '人工智能']
});

console.log(result.advice);
```

---

## 项目集成步骤

### 步骤1：更新路由配置

在 <mcfile name="app.ts" path="/Users/fxy/Downloads/gaokao-ai/src/app.ts"></mcfile> 中添加知识库路由：

```typescript
import knowledgeBaseRoutes from './routes/knowledgeBaseRoutes';

// 注册路由
app.use('/api', knowledgeBaseRoutes);
```

### 步骤2：在现有控制器中集成

更新 <mcfile name="chat.ts" path="/Users/fxy/Downloads/gaokao-ai/src/controllers/chat.ts"></mcfile>：

```typescript
import knowledgeBaseService from '../services/knowledgeBaseService';

export const chat = async (req: Request, res: Response) => {
  try {
    const { question, province } = req.body;
    
    // 使用知识库增强回答
    const searchResults = await knowledgeBaseService.search(question, 5);
    
    let context = '';
    if (question.includes('政策')) {
      const policyData = await knowledgeBaseService.getPolicyData();
      context += JSON.stringify(policyData);
    }
    
    if (question.includes('专业')) {
      const majorsData = await knowledgeBaseService.getMajorsData();
      context += JSON.stringify(majorsData);
    }
    
    // 原有的AI处理逻辑...
    const reply = await getAi.chat(`
      基于以下知识库信息：
      ${context}
      
      搜索结果：
      ${JSON.stringify(searchResults)}
      
      回答问题：${question}
    `);
    
    res.json({ success: true, data: { reply } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 步骤3：预加载常用数据

在应用启动时预加载：

```typescript
// app.ts
import knowledgeBaseService from './services/knowledgeBaseService';

async function initializeApp() {
  // 预加载常用知识库
  console.log('正在加载知识库...');
  await knowledgeBaseService.getPolicyData();
  await knowledgeBaseService.getRegionsData();
  console.log('知识库加载完成');
  
  // 启动服务器
  app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
  });
}

initializeApp();
```

### 步骤4：前端调用示例

```javascript
// 前端代码
class GaokaoKnowledgeBase {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }
  
  // 智能问答
  async chat(question, province = '北京') {
    const response = await fetch(`${this.baseUrl}/api/kb-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, province })
    });
    return response.json();
  }
  
  // 获取知识库数据
  async getKnowledgeBase(type) {
    const response = await fetch(
      `${this.baseUrl}/api/knowledge-base?type=${type}`
    );
    return response.json();
  }
  
  // 搜索知识库
  async search(query, limit = 10) {
    const response = await fetch(`${this.baseUrl}/api/kb-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit })
    });
    return response.json();
  }
}

// 使用
const kb = new GaokaoKnowledgeBase();

// 问答
const answer = await kb.chat('北京高考报名时间');
console.log(answer.data.reply);

// 获取专业信息
const majors = await kb.getKnowledgeBase('majors');
console.log(majors.data);

// 搜索
const results = await kb.search('计算机专业');
console.log(results.data.results);
```

---

## 维护与更新

### 更新知识库数据

1. **直接编辑JSON文件**：修改 `src/knowledgebase/` 目录下的对应文件
2. **清除缓存**：确保更新生效

```typescript
import knowledgeBaseService from './services/knowledgeBaseService';
knowledgeBaseService.clearCache();
```

3. **验证数据**：使用搜索功能测试

```typescript
const results = await knowledgeBaseService.search('测试内容');
console.log(results);
```

### 监控与优化

```typescript
// 添加性能监控
import knowledgeBaseService from './services/knowledgeBaseService';

async function monitorPerformance() {
  const startTime = Date.now();
  
  await knowledgeBaseService.getPolicyData();
  
  const loadTime = Date.now() - startTime;
  console.log(`知识库加载耗时: ${loadTime}ms`);
  
  if (loadTime > 1000) {
    console.warn('知识库加载较慢，建议优化');
  }
}
```

### 备份策略

```bash
# 定期备份知识库文件
cp -r src/knowledgebase backups/knowledgebase_$(date +%Y%m%d)

# 使用版本控制
git add src/knowledgebase/
git commit -m "更新知识库数据"
```

---

## 总结

本知识库系统提供了：

✅ **9个专业知识库**：覆盖高考全流程
- 政策信息、地区数据、科类分类
- 专业目录、院校信息
- 志愿填报、职业规划、医学考试、学籍管理

✅ **完整的服务层**：<mcfile name="knowledgeBaseService.ts" path="/Users/fxy/Downloads/gaokao-ai/src/services/knowledgeBaseService.ts"></mcfile>
- 统一的数据加载接口
- 智能缓存机制
- 全文搜索功能

✅ **RESTful API**：<mcfile name="knowledgeBaseRoutes.ts" path="/Users/fxy/Downloads/gaokao-ai/src/routes/knowledgeBaseRoutes.ts"></mcfile>
- `/api/kb-chat` - 知识库增强型问答
- `/api/knowledge-base` - 获取知识库数据
- `/api/kb-search` - 搜索知识库

✅ **示例控制器**：<mcfile name="knowledgeBaseChat.ts" path="/Users/fxy/Downloads/gaokao-ai/src/controllers/knowledgeBaseChat.ts"></mcfile>
- 展示完整集成方式
- 结合AI生成智能回答

### 下一步建议

1. **扩展知识库内容**：添加更多省份、院校、专业数据
2. **优化搜索算法**：引入相关性评分、模糊匹配
3. **添加数据验证**：确保JSON格式正确性
4. **实现数据库存储**：处理大规模数据
5. **添加管理界面**：方便更新维护知识库

---

**完整文档版本**: v1.0  
**最后更新**: 2025年  
**联系支持**: 如有问题请查看项目README或提交Issue