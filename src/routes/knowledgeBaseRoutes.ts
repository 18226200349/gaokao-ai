import express from 'express';
import knowledgeBaseChatController from '../controllers/knowledgeBaseChat';

const router = express.Router();

/**
 * 知识库增强型聊天接口
 * POST /api/kb-chat
 * 请求体：
 * {
 *   "question": "用户问题",
 *   "province": "省份（可选，默认北京）",
 *   "conversationHistory": [对话历史（可选）]
 * }
 */
router.post('/kb-chat', knowledgeBaseChatController.chat);

/**
 * 获取特定知识库数据
 * GET /api/knowledge-base?type=policy|regions|majors|universities|admission|career|medical|student_status|subject_categories|all
 */
router.get('/knowledge-base', knowledgeBaseChatController.getKnowledgeBase);

/**
 * 搜索知识库
 * POST /api/kb-search
 * 请求体：
 * {
 *   "query": "搜索关键词",
 *   "maxResults": 10（可选，默认10）
 * }
 */
router.post('/kb-search', knowledgeBaseChatController.searchKnowledgeBase);

export default router;