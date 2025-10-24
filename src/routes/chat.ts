import express from 'express'
import chatController from '../controllers/chat'

const router = express.Router()

// 流式聊天接口
router.post('/stream', chatController.streamChat)

// 普通聊天接口
router.post('/', chatController.chat)

export default router