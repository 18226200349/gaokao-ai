# 表格分页功能修复

## 🐛 问题描述

在高考查询（GaokaoQuery）页面，表格的"x条/页"切换功能无效。用户选择不同的每页显示条数时，表格不会重新渲染。

## 🔍 问题原因

**原始代码：**
```typescript
pagination={{
  pageSize: 10,  // 硬编码的固定值
  showSizeChanger: true,
  // ...
}}
```

**问题分析：**
- `pageSize` 使用硬编码的固定值 `10`
- 没有使用状态（state）管理分页参数
- Ant Design Table 的 `onChange` 回调没有被处理
- 用户切换每页条数时，组件无法响应变化

## ✅ 解决方案

### 1. 添加分页状态

```typescript
const [currentPage, setCurrentPage] = useState(1)
const [pageSize, setPageSize] = useState(10)
```

### 2. 完善分页配置

```typescript
pagination={{
  current: currentPage,              // 当前页码（受控）
  pageSize: pageSize,                // 每页条数（受控）
  showSizeChanger: true,             // 显示切换器
  showQuickJumper: true,             // 显示快速跳转
  showTotal: (total) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100'],  // 可选项
  onChange: (page, size) => {
    setCurrentPage(page)
    if (size !== pageSize) {
      setPageSize(size)
      setCurrentPage(1)  // 切换条数时回到第一页
    }
  },
  style: { marginTop: '16px' }
}}
```

### 3. 重置逻辑

**在以下场景重置分页：**

1. **重置按钮**
```typescript
const handleReset = () => {
  form.resetFields()
  setData([])
  setCurrentPage(1)    // 重置到第一页
  setPageSize(10)      // 重置为默认值
}
```

2. **切换查询类型**
```typescript
onChange={(value) => {
  setQueryType(value)
  form.resetFields()
  setData([])
  setCurrentPage(1)
  setPageSize(10)
}}
```

3. **新查询**
```typescript
if (response.data.success) {
  setData(response.data.data || [])
  setCurrentPage(1)  // 新结果，回到第一页
  // ...
}
```

## 📊 功能特性

### 分页选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| 每页10条 | 默认显示 | ✅ |
| 每页20条 | 中等数据量 | - |
| 每页50条 | 大数据量 | - |
| 每页100条 | 超大数据量 | - |

### 交互逻辑

**切换每页条数：**
```
用户操作：选择"20条/页"
系统响应：
1. 更新 pageSize 为 20
2. 重置 currentPage 为 1
3. 表格重新渲染，显示前20条
```

**翻页：**
```
用户操作：点击"下一页"
系统响应：
1. 更新 currentPage += 1
2. pageSize 保持不变
3. 表格显示对应页的数据
```

**快速跳转：**
```
用户操作：输入页码"5"，按回车
系统响应：
1. 更新 currentPage 为 5
2. pageSize 保持不变
3. 跳转到第5页
```

## 🎯 使用场景

### 场景1：查看大量数据

```
1. 用户查询"985高校" → 获得50条结果
2. 默认显示：每页10条，共5页
3. 用户选择"50条/页"
4. 结果：一页显示全部50条数据
```

### 场景2：切换查询类型

```
1. 当前：高校查询，第3页，每页20条
2. 切换到：专业查询
3. 结果：自动重置为第1页，每页10条（默认）
```

### 场景3：重新查询

```
1. 当前：第5页，每页50条
2. 点击"重置"按钮
3. 结果：清空数据，重置为第1页，每页10条
4. 输入新条件，点击"查询"
5. 结果：显示新结果的第1页
```

## 🔧 技术实现

### 状态管理

```typescript
// 分页状态
const [currentPage, setCurrentPage] = useState(1)    // 当前页码
const [pageSize, setPageSize] = useState(10)        // 每页条数

// 查询状态
const [data, setData] = useState([])                // 查询结果
const [loading, setLoading] = useState(false)       // 加载状态
```

### onChange 回调处理

```typescript
onChange: (page, size) => {
  // 更新当前页
  setCurrentPage(page)
  
  // 如果每页条数改变
  if (size !== pageSize) {
    setPageSize(size)      // 更新每页条数
    setCurrentPage(1)      // 重置到第一页
  }
}
```

**逻辑说明：**
- `page`: 用户点击的页码或输入的页码
- `size`: 用户选择的每页条数
- 当 `size` 改变时，自动回到第一页（避免页码溢出）

### 受控组件模式

```typescript
// ❌ 错误：非受控
<Table pagination={{ pageSize: 10 }} />

// ✅ 正确：受控
<Table 
  pagination={{ 
    current: currentPage,
    pageSize: pageSize,
    onChange: (page, size) => {
      setCurrentPage(page)
      setPageSize(size)
    }
  }} 
/>
```

## 📈 性能优化

### 前端分页 vs 后端分页

**当前实现：前端分页**
- 一次获取所有数据
- 在前端进行分页展示
- 适合数据量较小的场景（< 1000条）

**未来优化：后端分页**
```typescript
// 发送分页参数到后端
const params = {
  page: currentPage,
  pageSize: pageSize,
  // ... 其他查询条件
}

// 后端返回分页数据
{
  data: [...],
  total: 1000,
  page: 1,
  pageSize: 10
}
```

### 数据缓存

可以考虑缓存已查询的页面数据：

```typescript
const [pageCache, setPageCache] = useState<Map<number, any[]>>(new Map())

// 切换页面时先查缓存
const loadPage = (page: number) => {
  if (pageCache.has(page)) {
    // 使用缓存
    return pageCache.get(page)
  } else {
    // 请求后端
    // ...
  }
}
```

## 🎨 UI/UX 优化

### 分页器样式

- 圆角按钮
- 悬停效果
- 当前页高亮
- 禁用状态提示

### 信息提示

```typescript
showTotal: (total: number) => `共 ${total} 条记录`
```

显示效果：
```
共 50 条记录  [< 1 2 3 4 5 >]  10条/页
```

### 响应式设计

```css
@media (max-width: 768px) {
  .ant-pagination {
    /* 移动端简化分页器 */
    font-size: 12px;
  }
  
  .ant-pagination-options {
    /* 隐藏每页条数选择器 */
    display: none;
  }
}
```

## 🐛 常见问题

### Q1: 切换每页条数后，还停留在之前的页码？

**原因：** 没有在 `onChange` 中重置 `currentPage`

**解决：**
```typescript
if (size !== pageSize) {
  setPageSize(size)
  setCurrentPage(1)  // 重要：重置页码
}
```

### Q2: 数据更新后，分页器显示不正确？

**原因：** 数据变化但 `current` 和 `pageSize` 未同步

**解决：** 查询成功后重置页码
```typescript
setData(newData)
setCurrentPage(1)
```

### Q3: 总页数计算错误？

**原因：** Ant Design 自动计算总页数 = `Math.ceil(total / pageSize)`

**检查：** 确保 `dataSource` 长度正确
```typescript
<Table 
  dataSource={data}  // 确保 data 是完整数组
  pagination={{
    pageSize: pageSize,
    total: data.length  // 可选：明确指定总数
  }}
/>
```

## 📝 最佳实践

### 1. 使用受控组件
```typescript
✅ current={currentPage}
✅ pageSize={pageSize}
❌ defaultCurrent={1}
❌ defaultPageSize={10}
```

### 2. 合理的每页条数选项
```typescript
pageSizeOptions: ['10', '20', '50', '100']
// 避免：['5', '15', '37', '999']
```

### 3. 切换条数时重置页码
```typescript
if (size !== pageSize) {
  setPageSize(size)
  setCurrentPage(1)  // 必须重置
}
```

### 4. 新查询时重置分页
```typescript
const handleSearch = async () => {
  // ...
  setData(newData)
  setCurrentPage(1)  // 重要
}
```

### 5. 提供总数信息
```typescript
showTotal: (total) => `共 ${total} 条记录`
```

## 🚀 扩展功能

### 记住用户偏好

```typescript
// 保存到 localStorage
useEffect(() => {
  localStorage.setItem('preferredPageSize', pageSize.toString())
}, [pageSize])

// 初始化时读取
const [pageSize, setPageSize] = useState(() => {
  const saved = localStorage.getItem('preferredPageSize')
  return saved ? parseInt(saved) : 10
})
```

### 分页位置

```typescript
pagination={{
  // ...
  position: ['topRight', 'bottomRight']  // 顶部和底部都显示
}}
```

### 简洁模式

```typescript
pagination={{
  simple: true,  // 简洁模式：仅显示页码和上下翻页
  // 适合移动端
}}
```

## 📄 相关文件

- `client/src/pages/GaokaoQuery.tsx` - 高考查询页面
- [Ant Design Table 文档](https://ant.design/components/table-cn/)

