import express from 'express'
var router = express.Router();
// const userController = require('../controllers/user');
/* GET home page - redirect to chat */
router.get('/', function(req: any, res: any, next: any) {
  res.render('chat', { title: '高考AI聊天助手' });
});

// router.get('/get_user', userController.showUser)

/* GET chat page. */
router.get('/chat', function(req: any, res: any, next: any) {
  res.render('chat', { title: '高考AI聊天助手' });
});

/* GET solution page. */
router.get('/solution', function(req: any, res: any, next: any) {
  res.render('solution', { title: '志愿填报方案' });
});

export default router;
