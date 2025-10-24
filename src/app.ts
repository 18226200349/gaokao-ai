import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import logger from '../logger';
import cors from 'cors';
import multer from 'multer';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import chatRouter from './routes/chat'
import gaokaoRouter from './routes/gaokao'
import knowledgeBaseRoutes from './routes/knowledgeBaseRoutes';
import routes from './routes'
import MoonshotAIChatbot from './services/getAi';
import compression from 'compression'
// (async () => {
//   const steam = await MoonshotAIChatbot.streamChat('简短介绍一下react')
//    for await (const model of steam) {
//       const content = model.choices[0].delta?.content
//       console.log(content,'content')
//     }
// })()

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: '*',
};


const app = express();

const baseUrl = '/api/v1'

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('dev') as any);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser() as any);
app.use(cors(corsOptions))
app.use(compression())

// 静态文件中间件应该放在所有路由之前
// 首先提供public目录的静态文件服务（保持原有的Jade模板样式正常）
const publicPath = path.join(__dirname, '..', 'public');
console.log('Static files path:', publicPath);
app.use(express.static(publicPath));

// 然后提供React构建产物的静态文件服务
const distPath = path.join(__dirname, '..', 'dist');
console.log('React build files path:', distPath);
app.use(express.static(distPath));

// 传统页面路由（Jade模板）- 只保留jade路径
app.get('/jade', (req: Request, res: Response) => {
  res.render('chat', { title: '高考AI聊天助手' });
});

// API路由配置
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/gaokao', gaokaoRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1', knowledgeBaseRoutes);

// 对于所有非API路由，返回React应用的index.html (支持客户端路由)
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  // 如果是API路由，继续到404处理
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // 返回React应用的index.html (SPA路由支持)
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      next(createError(404));
    }
  });
});

// catch 404 and forward to error handler (只处理API路由的404)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
const _errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.originalUrl} ` + err.message)
  const errorMsg = err.message
  res.status(err.status || 500).json({
    code: -1,
    success: false,
    message: errorMsg,
    data: {}
  })
}
app.use(_errorHandler)

export default app as any;