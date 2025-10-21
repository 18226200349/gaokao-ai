import MoonshotAIChatbot from '../services/getAi'

const chatController = {
  chat: async function (req: any, res: any, next: any) {
    // res.setHeader('Content-Type', 'text/event-stream')
    try {
      const question = req.body.question
      // const isVisitor = req.body.isVisitor
      // const history = req.body.history
      const isSingleChat = req.body.isSingleChat
      // const systemPrompt = req.body.systemPrompt
      if (isSingleChat) {
        const completion: any = await MoonshotAIChatbot.chat(question)
        res.json({
          code: 200,
          message: '操作成功',
          data: { result: completion },
        })
      } else {
        // 流式聊天模式暂不支持
        res.json({
          code: 200,
          message: '操作成功',
          data: { result: '请输入问题' },
        })
      }
      
    } catch (error: any) {
      res.write(`requireError/%/${error.status}/%/${error.message}`)
      res.end()
    }
  },

}

export default chatController
