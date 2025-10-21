import express from 'express'
import chatController from '../controllers/chat'

const router = express.Router()

// 聊天接口
router.post('/', chatController.chat)

export default router