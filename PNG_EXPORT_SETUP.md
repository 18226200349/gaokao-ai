# PNG导出功能设置说明

## 📦 安装依赖

在使用PNG导出功能前，需要先安装html2canvas依赖：

```bash
cd client
pnpm install html2canvas
```

或者从项目根目录运行：

```bash
npm install
```

这会自动安装client目录下的所有依赖（因为有postinstall脚本）。

## ✨ 功能说明

### 导出方案为PNG图片

当用户点击"导出方案"按钮时：

1. **显示加载提示** - "正在生成图片..."
2. **截取页面内容** - 使用html2canvas将整个方案页面转换为canvas
3. **生成高清图片** - 使用2倍分辨率确保清晰度
4. **自动下载** - 将图片保存为PNG文件

### 文件命名格式

```
志愿填报方案_省份_分数_时间戳.png
```

例如：`志愿填报方案_北京_650分_1234567890.png`

## 🎨 导出选项

### html2canvas配置

```typescript
{
  backgroundColor: '#f5f5f5',  // 背景色
  scale: 2,                     // 2倍分辨率（高清）
  useCORS: true,                // 支持跨域图片
  logging: false,               // 关闭日志
  windowWidth: scrollWidth,     // 完整宽度
  windowHeight: scrollHeight    // 完整高度
}
```

### 导出内容包括

- ✅ 页面标题和基本信息
- ✅ 用户信息卡片（省份、科类、分数、位次）
- ✅ 推荐院校方案（稳妥、稳健、冲刺）
- ✅ 推荐专业列表
- ✅ 所有样式和布局

## 💡 使用方法

### 用户操作流程

1. 在"志愿填报方案"页面查看方案
2. 点击"导出方案"按钮
3. 等待图片生成（约1-3秒）
4. 图片自动下载到本地

### 注意事项

- 导出的是整个页面的截图
- 包含当前选中的Tab内容
- 保持原有的样式和布局
- 图片格式为PNG（支持透明背景）

## 🔧 技术实现

### 核心代码

```typescript
// 使用html2canvas将DOM转换为canvas
const canvas = await html2canvas(solutionRef.current, options)

// 将canvas转换为Blob
canvas.toBlob((blob: Blob | null) => {
  if (blob) {
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}, 'image/png')
```

### Ref引用

```typescript
const solutionRef = useRef<HTMLDivElement>(null)

<div ref={solutionRef}>
  {/* 方案内容 */}
</div>
```

## 📱 兼容性

- ✅ Chrome/Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ 现代浏览器

## 🚀 性能优化

- 使用异步处理，不阻塞UI
- 显示加载提示，提升用户体验
- 自动清理临时URL，避免内存泄漏
- 2倍分辨率平衡清晰度和性能

## 🐛 故障排除

### 如果导出失败

1. 检查html2canvas是否已安装
2. 查看浏览器控制台错误信息
3. 确认页面内容已完全加载
4. 尝试关闭浏览器扩展（如广告拦截）

### 图片不清晰

- 已设置scale为2倍
- 如需更高清晰度，可调整scale参数（会影响性能）

## 📄 相关文件

- `client/package.json` - 添加了html2canvas依赖
- `client/src/pages/Solution.tsx` - 实现了导出功能

