import MoonshotAIChatbot from '../services/getAi'

const chatController = {
  chat: async function (req: any, res: any, next: any) {
    try {
      const question = req.body.question
      
      // 参数校验
      if (!question) {
        return res.json({
          code: 400,
          message: '缺少必要参数：question',
          data: null
        });
      }
      
      // 获取AI回复
      const reply = await MoonshotAIChatbot.chat(question);
      
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
