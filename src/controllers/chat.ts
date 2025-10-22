import gaokaoService from '../services/gaokaoService';
import getAi from '../services/getAi';

const chatController = {
  chat: async function (req: any, res: any, next: any) {
    try {
      const question = req.body.question
      const province = req.body.province || '北京'; // 默认使用北京
      const userInfo = req.body.userInfo || { province, schoolProvince: province };
      const interests = req.body.interests || ['理工'];
      
      // 参数校验
      if (!question) {
        return res.json({
          code: 400,
          message: '缺少必要参数：question',
          data: null
        });
      }
      
      // 根据问题内容调用不同的服务方法
      let reply = '';
      
      // 1. 政策解读
      if (question.includes('政策') || question.includes('报名时间') || question.includes('考试时间')) {
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
      // 6. 其他问题使用AI回答
      else {
        // 先尝试从gaokaoService获取信息，再使用AI进行补充
        const policyInfo = gaokaoService.interpretPolicy(province);
        const context = `基于以下高考政策信息回答用户问题：\n${policyInfo}\n\n用户问题：${question}`;
        reply = await getAi.chat(context);
      }
      
      // 返回结果
      res.json({
        code: 200,
        message: '操作成功',
        data: { 
          reply: reply
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
  }
}

export default chatController;
