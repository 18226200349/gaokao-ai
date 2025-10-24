import { knowledgeBaseService } from '../services/knowledgeBaseService';
import getAi from '../services/getAi';

/**
 * 知识库增强型聊天控制器
 * 展示如何在聊天功能中集成和使用知识库服务
 */
const knowledgeBaseChatController = {
  /**
   * 知识库增强型聊天接口
   * 根据用户问题从知识库中检索相关信息，并结合AI生成回答
   */
  chat: async function (req: any, res: any, next: any) {
    try {
      const question = req.body.question;
      const province = req.body.province || '北京';
      const conversationHistory = req.body.conversationHistory || [];
      
      // 参数校验
      if (!question) {
        return res.json({
          code: 400,
          message: '缺少必要参数：question',
          data: null
        });
      }
      
      // 1. 从知识库中搜索相关信息
      const searchResults = await knowledgeBaseService.search(question);
      
      // 2. 根据问题类型获取特定知识库数据
      let contextInfo = '';
      
      // 2.1 政策相关问题
      if (question.includes('政策') || question.includes('报名') || question.includes('考试时间')) {
        const policyData = await knowledgeBaseService.getPolicyData();
        contextInfo += `\n高考政策信息：\n${JSON.stringify(policyData, null, 2)}\n`;
      }
      
      // 2.2 地区相关问题
      if (question.includes('地区') || question.includes(province)) {
        const regionsData = await knowledgeBaseService.getRegionsData();
        const regionInfo = regionsData.regions.find((r: any) => r.name === province);
        if (regionInfo) {
          contextInfo += `\n${province}地区信息：\n${JSON.stringify(regionInfo, null, 2)}\n`;
        }
      }
      
      // 2.3 专业相关问题
      if (question.includes('专业') || question.includes('学科')) {
        const majorsData = await knowledgeBaseService.getMajorsData();
        contextInfo += `\n专业信息：\n${JSON.stringify(majorsData, null, 2)}\n`;
      }
      
      // 2.4 院校相关问题
      if (question.includes('大学') || question.includes('院校') || question.includes('高校')) {
        const universitiesData = await knowledgeBaseService.getUniversitiesData();
        contextInfo += `\n院校信息：\n${JSON.stringify(universitiesData, null, 2)}\n`;
      }
      
      // 2.5 志愿填报相关问题
      if (question.includes('志愿') || question.includes('填报') || question.includes('录取')) {
        const admissionData = await knowledgeBaseService.getAdmissionGuideData();
        contextInfo += `\n志愿填报指导：\n${JSON.stringify(admissionData, null, 2)}\n`;
      }
      
      // 2.6 职业规划相关问题
      if (question.includes('职业') || question.includes('就业') || question.includes('发展')) {
        const careerData = await knowledgeBaseService.getCareerPlanningData();
        contextInfo += `\n职业规划信息：\n${JSON.stringify(careerData, null, 2)}\n`;
      }
      
      // 2.7 体检相关问题
      if (question.includes('体检') || question.includes('身体') || question.includes('健康')) {
        const medicalData = await knowledgeBaseService.getMedicalExamData();
        contextInfo += `\n体检标准信息：\n${JSON.stringify(medicalData, null, 2)}\n`;
      }
      
      // 2.8 学籍相关问题
      if (question.includes('学籍') || question.includes('转学') || question.includes('户籍')) {
        const studentStatusData = await knowledgeBaseService.getStudentStatusData();
        contextInfo += `\n学籍管理信息：\n${JSON.stringify(studentStatusData, null, 2)}\n`;
      }
      
      // 2.9 科类相关问题
      if (question.includes('文科') || question.includes('理科') || question.includes('选科')) {
        const subjectData = await knowledgeBaseService.getSubjectCategoriesData();
        contextInfo += `\n科类信息：\n${JSON.stringify(subjectData, null, 2)}\n`;
      }
      
      // 3. 构建完整的上下文
      let fullContext = `基于以下知识库信息和对话历史回答用户问题：\n\n`;
      
      // 添加搜索结果
      if (searchResults && searchResults.length > 0) {
        fullContext += `搜索结果：\n${JSON.stringify(searchResults, null, 2)}\n\n`;
      }
      
      // 添加特定知识库信息
      if (contextInfo) {
        fullContext += contextInfo;
      }
      
      // 添加对话历史
      if (conversationHistory && conversationHistory.length > 0) {
        fullContext += '\n对话历史：\n';
        conversationHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            fullContext += `用户：${msg.content}\n`;
          } else if (msg.role === 'ai') {
            fullContext += `助手：${msg.content}\n`;
          }
        });
      }
      
      // 添加当前问题
      fullContext += `\n当前用户问题：${question}\n\n`;
      fullContext += `请基于上述知识库信息，提供准确、详细且有帮助的回答。如果知识库中没有相关信息，请明确告知用户。`;
      
      // 4. 调用AI生成回答
      const reply = await getAi.chat(fullContext);
      
      // 5. 返回结果
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          reply,
          searchResultsCount: searchResults?.length || 0,
          hasContextInfo: !!contextInfo
        }
      });
    } catch (error: any) {
      console.error('知识库聊天错误：', error);
      res.json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  /**
   * 获取特定知识库数据的接口
   */
  getKnowledgeBase: async function (req: any, res: any, next: any) {
    try {
      const { type } = req.query;
      
      let data: any;
      
      switch (type) {
        case 'policy':
          data = await knowledgeBaseService.getPolicyData();
          break;
        case 'regions':
          data = await knowledgeBaseService.getRegionsData();
          break;
        case 'majors':
          data = await knowledgeBaseService.getMajorsData();
          break;
        case 'universities':
          data = await knowledgeBaseService.getUniversitiesData();
          break;
        case 'admission':
          data = await knowledgeBaseService.getAdmissionGuideData();
          break;
        case 'career':
          data = await knowledgeBaseService.getCareerPlanningData();
          break;
        case 'medical':
          data = await knowledgeBaseService.getMedicalExamData();
          break;
        case 'student_status':
          data = await knowledgeBaseService.getStudentStatusData();
          break;
        case 'subject_categories':
          data = await knowledgeBaseService.getSubjectCategoriesData();
          break;
        case 'all':
          data = await knowledgeBaseService.loadAllSections();
          break;
        default:
          return res.json({
            code: 400,
            message: '无效的知识库类型',
            data: null
          });
      }
      
      res.json({
        code: 200,
        message: '操作成功',
        data
      });
    } catch (error: any) {
      console.error('获取知识库数据错误：', error);
      res.json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  /**
   * 搜索知识库的接口
   */
  searchKnowledgeBase: async function (req: any, res: any, next: any) {
    try {
      const { query, maxResults = 10 } = req.body;
      
      if (!query) {
        return res.json({
          code: 400,
          message: '缺少必要参数：query',
          data: null
        });
      }
      
      const results = await knowledgeBaseService.search(query, maxResults);
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          query,
          results,
          count: results.length
        }
      });
    } catch (error: any) {
      console.error('搜索知识库错误：', error);
      res.json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  }
};

export default knowledgeBaseChatController;