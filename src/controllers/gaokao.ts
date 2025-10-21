// 高考报名AI助手控制器
import gaokaoService from '../services/gaokaoService'
import { Response } from 'express';
import ExcelJS from 'exceljs';

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
  }
}

export default gaokaoController