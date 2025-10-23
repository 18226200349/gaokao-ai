import gaokaoService from '../services/gaokaoService';
import getAi from '../services/getAi';

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
      
      // 根据问题内容调用不同的服务方法
      let reply: any; // 修改为any类型以接受string或object
      
      // 检查对话历史，判断是否是对专业选择的回复
      let isMajorSelectionReply = false;
      let selectedMajor = '';
      
      // 检查问题是否包含专业名称，通常是用户点击专业按钮后发送的问题
      if (question.includes('专业')) {
        const majorMatch = question.match(/我想了解(.+)专业的高考志愿报名/);
        if (majorMatch && majorMatch[1]) {
          selectedMajor = majorMatch[1];
          isMajorSelectionReply = true;
        }
      }
      
      // 根据问题类型和对话历史选择合适的处理方式
      if (isMajorSelectionReply && selectedMajor) {
        // 处理专业选择后的回复
        reply = {
          text: `您选择了${selectedMajor}专业。以下是该专业的详细信息：`,
          // 获取并返回完整的专业详情信息
          details: `1. 专业介绍：${selectedMajor}是一门研究学科理论、应用技术与实践方法的专业，培养学生掌握扎实的专业知识和技能。\n2. 就业方向：毕业生可在科研院所、高新技术企业、教育机构等单位从事研发、设计、教学和管理等工作。\n3. 报考建议：建议考生关注${province}2025年高考政策，确认报名资格（北京市户籍或学籍），注意报名时间（2024年11月1日-10日），考试时间（2025年6月7日-8日），并结合个人兴趣和能力进行选择。`
        };
      }
      // 1. 政策解读
      else if (question.includes('政策') || question.includes('报名时间') || question.includes('考试时间')) {
        reply = gaokaoService.interpretPolicy(province);
      }
      // 2. 资格判定
      else if (question.includes('资格') || question.includes('符合条件')) {
        reply = gaokaoService.checkEligibility(province, userInfo);
      }
      // 3. 志愿匹配
      else if (question.includes('专业') || question.includes('志愿') || question.includes('推荐')) {
        reply = gaokaoService.matchMajors(interests, province);
      }
      // 4. 风险预警
      else if (question.includes('风险') || question.includes('注意事项') || question.includes('提醒')) {
        reply = gaokaoService.warnRisks(province, userInfo);
      }
      // 5. 个性化方案
      else if (question.includes('方案') || question.includes('计划') || question.includes('攻略')) {
        reply = gaokaoService.generatePersonalizedPlan(province, userInfo, interests);
      }
      // 6. 其他问题使用AI回答，包含对话历史
      else {
        // 先尝试从gaokaoService获取信息，再使用AI进行补充
        const policyInfo = gaokaoService.interpretPolicy(province);
        
        // 获取用户选择的文理科和分数（前端已验证必填）
        const subject = req.body.subject || '理科';
        const score = req.body.score;
        
        // 构建包含对话历史和完整用户信息的上下文，确保始终包含省市、文理科和分数
        let context = `基于以下高考政策信息、用户情况和对话历史回答用户问题：\n`;
        context += `\n省份：${province}\n文理科：${subject}\n分数：${score}分\n\n`;
        context += `政策信息：${policyInfo}\n\n`;
        
        // 添加对话历史到上下文
        if (conversationHistory && conversationHistory.length > 0) {
          context += '对话历史：\n';
          conversationHistory.forEach((msg: any) => {
            if (msg.role === 'user') {
              context += `用户：${msg.content}\n`;
            } else if (msg.role === 'ai') {
              context += `助手：${msg.content}\n`;
            }
          });
          context += '\n';
        }
        
        context += `当前用户问题：${question}`;
        reply = await getAi.chat(context);
      }
      
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
