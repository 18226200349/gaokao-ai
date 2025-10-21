# 测试说明

## 如何创建测试用的Excel文件

1. 打开Microsoft Excel或任何其他电子表格应用程序（如Google Sheets、LibreOffice Calc等）
2. 在第一行的第一列（A1）输入"姓名"，在第二列（B1）输入您的姓名
3. 在第二行的第一列（A2）输入"省份"，在第二列（B2）输入您所在的省份（例如：北京）
4. 在第三行的第一列（A3）输入"科类"，在第二列（B3）输入您的科类（例如：理工）
5. 在第四行的第一列（A4）输入"成绩"，在第二列（B4）输入您的成绩（例如：600）
6. 将文件保存为Excel格式（.xlsx），命名为test-data.xlsx
7. 使用curl命令上传此文件进行测试：

```bash
curl -X POST http://localhost:4001/api/v1/gaokao/import-excel \
  -F "file=@test-data.xlsx" \
  -H "Content-Type: multipart/form-data"
```

这将测试我们新添加的Excel导入功能。