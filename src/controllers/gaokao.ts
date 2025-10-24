// 高考报名AI助手控制器
import gaokaoService from '../services/gaokaoService'
import { Response } from 'express';
import ExcelJS from 'exceljs';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import logger from '../../logger';

interface University {
  id: string;
  name: string;
  type: string;
  level: string;
  location: {
    province: string;
    city: string;
    district?: string;
    address?: string;
  };
  [key: string]: any;
}

const gaokaoController = {
  // 处理高考报名咨询请求
  consult: async function (req: any, res: any, next: any) {
    try {
      // 获取请求参数
      const { province, userInfo, interests } = req.body
      
      // 参数校验
      if (!province) {
        return res.json({
          code: 400,
          message: '缺少必要参数：province',
          data: null
        });
      }
      
      // 生成个性化报名方案
      const plan = gaokaoService.generatePersonalizedPlan(province, userInfo || {}, interests || []);
      
      // 返回结果
      res.json({
        code: 200,
        message: '操作成功',
        data: { 
          plan: plan,
          // 这里可以添加更多结构化数据
          provinceInfo: {
            name: province,
            registrationDeadline: '请参考方案中的报名时间'
          }
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
  },
  
  // 导出Excel报名方案
  exportExcel: async function (req: any, res: any, next: any) {
    try {
      // 获取请求参数
      const { province, userInfo, interests } = req.body
      
      // 参数校验
      if (!province) {
        return res.status(400).json({
          code: 400,
          message: '缺少必要参数：province',
          data: null
        });
      }
      
      // 生成Excel文件
      const buffer = await gaokaoService.generateExcelPlan(province, userInfo || {}, interests || []);
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="gaokao-plan.xlsx"`);
      
      // 发送Excel文件
      res.send(buffer);
    } catch (error: any) {
      // 错误处理
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 获取省份列表
  getProvinces: async function (req: any, res: any, next: any) {
    try {
      // 在实际应用中，这些数据应该来自数据库
      const provinces = [
        { id: '北京', name: '北京市' },
        { id: '上海', name: '上海市' },
        { id: '广东', name: '广东省' },
        { id: '江苏', name: '江苏省' },
        { id: '浙江', name: '浙江省' }
      ];
      
      res.json({
        code: 200,
        message: '操作成功',
        data: { provinces }
      });
    } catch (error: any) {
      res.json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 解析上传的Excel文件并生成报名方案
  importExcel: async function (req: any, res: any, next: any) {
    try {
      // 检查是否有上传文件
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: '缺少上传文件',
          data: null
        });
      }

      // 解析Excel文件
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1);

      // 检查工作表是否存在
      if (!worksheet) {
        return res.status(400).json({
          code: 400,
          message: 'Excel文件格式错误，未找到工作表',
          data: null
        });
      }

      // 提取数据（假设第一行是标题行）
      const headers: string[] = [];
      const data: any[] = [];
      
      worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
        if (rowNumber === 1) {
          // 提取标题行
          row.eachCell((cell, colNumber) => {
            headers.push(cell.value?.toString() || '');
          });
        } else {
          // 提取数据行
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          data.push(rowData);
        }
      });

      // 从Excel数据中提取必要信息（假设只处理第一行数据）
      if (data.length === 0) {
        return res.status(400).json({
          code: 400,
          message: 'Excel文件中没有找到数据',
          data: null
        });
      }
      
      const firstRowData = data[0];
      const province = firstRowData['省份'] || firstRowData['province'];
      const userInfo = {
        name: firstRowData['姓名'] || firstRowData['name'],
        province: firstRowData['省份'] || firstRowData['province'],
        subject: firstRowData['科类'] || firstRowData['subject'],
        score: firstRowData['成绩'] || firstRowData['score']
      };
      const interests: string[] = [];

      // 参数校验
      if (!province) {
        return res.status(400).json({
          code: 400,
          message: 'Excel文件中缺少必要信息：省份',
          data: null
        });
      }

      // 生成个性化报名方案
      const plan = gaokaoService.generatePersonalizedPlan(province, userInfo, interests);

      // 返回结果
      res.json({
        code: 200,
        message: '操作成功',
        data: { 
          plan: plan,
          provinceInfo: {
            name: province,
            registrationDeadline: '请参考方案中的报名时间'
          }
        }
      });
    } catch (error: any) {
      // 错误处理
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 高考专用聊天接口
  chat: async function (req: any, res: any, next: any) {
    try {
      const { message, province } = req.body;
      
      // 参数校验
      if (!message) {
        return res.json({
          code: 400,
          success: false,
          message: '缺少必要参数：message',
          data: null
        });
      }
      
      // 这里可以调用AI服务，针对高考相关问题进行专门处理
      // 暂时返回一个模拟响应
      const reply = `关于高考的问题："${message}"，我建议你${province ? `在${province}` : ''}可以考虑以下几个方面：
1. 了解当地的高考政策和报名要求
2. 根据自己的兴趣和成绩选择合适的专业
3. 提前准备相关的报名材料
4. 关注重要的时间节点

如需更详细的个性化建议，请使用我们的高考咨询功能。`;
      
      res.json({
        code: 200,
        success: true,
        message: '操作成功',
        data: {
          reply: reply,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.json({
        code: 500,
        success: false,
        message: '服务器内部错误',
        data: { 
          error: error.message 
        }
      });
    }
  },
  
  // 获取大学列表
  getUniversities: async function (req: any, res: any, next: any) {
    try {
      const { level, location, keyword } = req.query;
      
      logger.info('获取大学列表', { level, location, keyword });
      
      // 从知识库获取大学数据
       const universitiesData = await knowledgeBaseService.getUniversitiesData();
       const universities: University[] = universitiesData?.universities || [];
      
      // 过滤数据
      let filteredUniversities = universities;
      
      // 按level过滤（支持模糊匹配，如985、211、双一流）
       if (level) {
         filteredUniversities = filteredUniversities.filter(u => 
           u.level && u.level.includes(level)
         );
       }
      
      // 按location过滤
      if (location) {
        filteredUniversities = filteredUniversities.filter(u => 
          u.location.province === location || u.location.city === location
        );
      }
      
      // 按keyword过滤
      if (keyword) {
        const keywordLower = keyword.toLowerCase();
        filteredUniversities = filteredUniversities.filter(u => 
          u.name.toLowerCase().includes(keywordLower) ||
          u.location.province.toLowerCase().includes(keywordLower) ||
          u.location.city.toLowerCase().includes(keywordLower)
        );
      }
      
      res.json({
        code: 200,
        message: '操作成功',
        data: {
          universities: filteredUniversities,
          total: filteredUniversities.length
        }
      });
    } catch (error: any) {
      logger.error('获取大学列表失败', error);
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

export default gaokaoController