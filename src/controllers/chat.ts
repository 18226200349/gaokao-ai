import getAi from '../services/getAi';
import { knowledgeBaseService } from '../services/knowledgeBaseService';

const chatController = {
  chat: async function (req: any, res: any, next: any) {
    try {
      const question = req.body.question
      const province = req.body.province || '北京'; // 默认使用北京
      const userInfo = req.body.userInfo || { province, schoolProvince: province };
      const interests = req.body.interests || ['理工'];
      const conversationHistory = req.body.conversationHistory || [];
      
      // 参数校验
      if (!question) {
        return res.json({
          code: 400,
          message: '缺少必要参数：question',
          data: null
        });
      }
      
      // 使用知识库增强的AI回答所有问题
      let reply: any;
      
      // 获取用户选择的文理科和分数
      const subject = req.body.subject || req.body.literaryOrScience || '理科';
      const score = req.body.score;
      
      // 使用知识库搜索增强上下文
      const searchResults = await knowledgeBaseService.search(question);
      
      // 构建包含知识库信息的上下文
      let context = `你是一个专业的高考志愿填报助手。请基于以下知识库数据、用户情况和对话历史，用专业、友好的语气回答用户的问题。\n\n`;
      context += `用户信息：\n省份：${province}\n文理科：${subject}${score ? `\n分数：${score}分` : ''}\n\n`;
        
      // 添加知识库搜索结果
      if (searchResults && searchResults.length > 0) {
        context += '知识库参考信息：\n';
        // 限制搜索结果数量，避免上下文过长
        const limitedResults = searchResults.slice(0, 5);
        limitedResults.forEach((result: any, index: number) => {
          if (result.value) {
            context += `${index + 1}. ${result.value}\n`;
          }
        });
        context += '\n';
      }
        
      // 添加对话历史到上下文
      if (conversationHistory && conversationHistory.length > 0) {
        context += '对话历史：\n';
        conversationHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            context += `用户：${msg.content}\n`;
          } else if (msg.role === 'ai' || msg.role === 'assistant') {
            context += `助手：${msg.content}\n`;
          }
        });
        context += '\n';
      }
      
      context += `当前问题：${question}\n\n请根据以上信息，给出准确、详细且有帮助的回答。`;
      reply = await getAi.chat(context);
      
      // 检查reply是否为对象，如果是对象则直接返回，否则返回字符串格式
      const responseData: any = {
        code: 200,
        message: '操作成功',
        data: {}
      };
      
      if (typeof reply === 'object' && reply !== null) {
        // 如果是对象，直接返回对象结构
        responseData.data = reply;
      } else {
        // 否则返回字符串格式
        responseData.data.reply = reply;
      }
      
      // 返回结果
      res.json(responseData);
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
  }
}

export default chatController;
