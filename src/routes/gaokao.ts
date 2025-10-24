// 高考报名AI助手路由
import express from 'express'
import gaokaoController from '../controllers/gaokao'
import multer from 'multer'

// 配置multer中间件
const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

// 高考报名咨询接口
router.post('/consult', gaokaoController.consult)

// 导出Excel报名方案接口
router.post('/export-excel', gaokaoController.exportExcel)

// 获取省份列表接口
router.get('/provinces', gaokaoController.getProvinces)

// 导入Excel文件并生成报名方案接口
router.post('/import-excel', upload.single('file'), gaokaoController.importExcel)

// 获取大学列表接口
router.get('/universities', gaokaoController.getUniversities)

// 获取专业列表接口
router.get('/majors', gaokaoController.getMajors)
// AI生成排名最高的10所学校接口
router.get('/universities/top-by-ai', gaokaoController.getTopUniversitiesByAI)
// 院校推荐接口
router.get('/universities/recommend', gaokaoController.recommendUniversities)

export default router