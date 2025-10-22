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
// 更正静态文件路径 - public目录在根目录下，不是src目录下
const publicPath = path.join(__dirname, '..', 'public');
console.log('Static files path:', publicPath);
app.use(express.static(publicPath));

// 路由配置
app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/gaokao', gaokaoRouter);

// catch 404 and forward to error handler
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