# 快速查询功能优化

## 🐛 问题描述

在高考查询页面，当用户先在表单中填写了一些筛选条件（如关键词、分数线等），然后点击快速查询按钮（如"北京高校"、"985高校"）时，之前填写的条件会被忽略，只使用快速查询按钮的条件进行查询。

## 🎯 用户场景示例

### 场景：查询北京地区600-650分的高校

**期望操作：**
```
1. 用户在表单中填写：
   - 最低分数线：600
   - 最高分数线：650
   - 关键词：工业

2. 点击"北京高校"快速查询按钮

3. 期望结果：查询北京地区、600-650分、名称包含"工业"的高校
```

**实际问题：**
```
❌ 之前填写的"600-650分"和"工业"条件被忽略
❌ 只查询"北京高校"，没有分数限制
```

## 🔍 问题原因

**原始代码：**
```typescript
const handleQuickSearch = (searchParams: any) => {
  form.setFieldsValue(searchParams)  // ❌ 直接设置，覆盖已有值
  handleSearch(searchParams)          // ❌ 只传递快速查询参数
}
```

**问题分析：**
1. `form.setFieldsValue(searchParams)` 只设置快速查询的字段
2. `handleSearch(searchParams)` 只传递快速查询参数
3. 表单中已填写的其他条件被忽略

## ✅ 解决方案

### 修改后的代码

```typescript
const handleQuickSearch = (searchParams: any) => {
  // 1. 获取当前表单已填写的值
  const currentValues = form.getFieldsValue()
  
  // 2. 合并快速查询参数和已有的表单值
  const mergedValues = { ...currentValues, ...searchParams }
  
  // 3. 更新表单显示
  form.setFieldsValue(mergedValues)
  
  // 4. 执行查询
  handleSearch(mergedValues)
}
```

### 实现逻辑

**步骤说明：**

1. **获取已有值**
   ```typescript
   const currentValues = form.getFieldsValue()
   // 获取表单中所有字段的当前值
   ```

2. **合并参数**
   ```typescript
   const mergedValues = { ...currentValues, ...searchParams }
   // 使用对象展开运算符合并
   // 快速查询参数会覆盖同名字段
   ```

3. **更新表单**
   ```typescript
   form.setFieldsValue(mergedValues)
   // 将合并后的值回显到表单
   ```

4. **执行查询**
   ```typescript
   handleSearch(mergedValues)
   // 使用合并后的完整参数查询
   ```

## 📊 使用示例

### 示例1：保留分数线条件

```
表单已填写：
- 最低分数线：600
- 最高分数线：650

点击快速查询：
- "北京高校" (location: '北京')

合并后的查询条件：
{
  location: '北京',      // 快速查询添加
  minScore: 600,         // ✅ 保留
  maxScore: 650          // ✅ 保留
}
```

### 示例2：保留关键词和层次

```
表单已填写：
- 关键词：交通
- 层次：211

点击快速查询：
- "上海高校" (location: '上海')

合并后的查询条件：
{
  keyword: '交通',       // ✅ 保留
  level: '211',          // ✅ 保留
  location: '上海'       // 快速查询添加
}
```

### 示例3：覆盖同名字段

```
表单已填写：
- 地区：北京
- 层次：本科

点击快速查询：
- "985高校" (level: '985')

合并后的查询条件：
{
  location: '北京',      // ✅ 保留
  level: '985'           // ⚠️ 覆盖原来的"本科"
}
```

### 示例4：专业查询保留条件

```
查询类型：专业查询
表单已填写：
- 关键词：计算机
- 专业类别：工学

点击快速查询：
- 自定义快速查询（如果有）

合并后的查询条件：
{
  keyword: '计算机',     // ✅ 保留
  category: '工学'       // ✅ 保留
}
```

## 🎨 合并策略

### JavaScript对象展开运算符

```typescript
const obj1 = { a: 1, b: 2, c: 3 }
const obj2 = { b: 20, d: 4 }

const merged = { ...obj1, ...obj2 }
// 结果: { a: 1, b: 20, c: 3, d: 4 }
//       ↑保留  ↑覆盖  ↑保留  ↑新增
```

### 在快速查询中的应用

```typescript
// 表单已有值
const currentValues = {
  keyword: '大学',
  minScore: 500,
  maxScore: 600
}

// 快速查询参数
const searchParams = {
  location: '北京'
}

// 合并结果
const mergedValues = { ...currentValues, ...searchParams }
// {
//   keyword: '大学',    ✅ 保留
//   minScore: 500,      ✅ 保留
//   maxScore: 600,      ✅ 保留
//   location: '北京'    ✅ 新增
// }
```

## 🔧 技术细节

### Form.getFieldsValue()

```typescript
// 获取所有字段值
const allValues = form.getFieldsValue()

// 获取指定字段值
const specificValues = form.getFieldsValue(['keyword', 'location'])

// 获取变更的字段值
const changedValues = form.getFieldsValue(true)
```

### 合并时的优先级

```typescript
const mergedValues = { 
  ...currentValues,   // 低优先级（基础值）
  ...searchParams     // 高优先级（覆盖值）
}

// 如果需要相反的优先级
const mergedValues = { 
  ...searchParams,    // 低优先级
  ...currentValues    // 高优先级（保留已有值）
}
```

### 处理undefined值

```typescript
// 如果表单字段未填写，getFieldsValue会返回undefined
const currentValues = {
  keyword: '大学',
  minScore: undefined,  // 未填写
  maxScore: 600
}

// 合并后undefined值会被保留
const merged = { ...currentValues, ...searchParams }
```

## 📈 用户体验提升

### 修改前

```
❌ 用户填写多个条件后，点击快速查询会丢失所有条件
❌ 用户需要重新填写之前的条件
❌ 操作繁琐，体验差
```

### 修改后

```
✅ 保留所有已填写的条件
✅ 快速查询只添加/覆盖特定字段
✅ 一键组合查询，操作便捷
✅ 用户体验大幅提升
```

## 🎯 实际应用场景

### 场景1：分数段内查找特定地区高校

```
步骤：
1. 填写：最低分600，最高分650
2. 点击：北京高校
3. 结果：查询北京地区600-650分的高校
4. 继续：点击"上海高校"切换地区
5. 结果：查询上海地区600-650分的高校（分数条件保留）
```

### 场景2：特定层次院校的关键词搜索

```
步骤：
1. 填写：关键词"交通"
2. 点击：985高校
3. 结果：查询名称包含"交通"的985高校
4. 继续：点击"211高校"
5. 结果：查询名称包含"交通"的211高校（关键词保留）
```

### 场景3：组合多种快速查询

```
步骤：
1. 点击：985高校
2. 填写：关键词"工业"
3. 点击：北京高校
4. 结果：查询北京地区名称包含"工业"的985高校
```

## 🐛 边界情况处理

### 1. 切换查询类型

```typescript
// 切换查询类型时会重置表单
onChange={(value) => {
  setQueryType(value)
  form.resetFields()      // 清空所有字段
  setData([])
  setCurrentPage(1)
  setPageSize(10)
}}

// 此时再点击快速查询，只会使用快速查询参数（符合预期）
```

### 2. 字段冲突

```typescript
// 表单已填写：location: '北京'
// 快速查询：location: '上海'
// 结果：location: '上海' (快速查询覆盖)
```

### 3. 空值处理

```typescript
// 如果当前表单所有字段都为空
const currentValues = {}

// 点击快速查询
const searchParams = { location: '北京' }

// 合并结果
const merged = { ...{}, ...{ location: '北京' } }
// = { location: '北京' }
```

## 📝 最佳实践

### 1. 合并策略要明确

```typescript
✅ 快速查询参数优先级高（覆盖同名字段）
✅ 保留其他已填写的字段
```

### 2. 提供视觉反馈

```typescript
// 可以考虑添加提示
message.info('已应用快速查询条件')

// 或者高亮显示快速查询添加的字段
form.setFieldsValue(mergedValues)
```

### 3. 重置功能

```typescript
// 用户可以通过"重置"按钮清空所有条件
const handleReset = () => {
  form.resetFields()
  setData([])
  setCurrentPage(1)
  setPageSize(10)
}
```

## 🚀 未来优化建议

### 1. 智能提示

```typescript
// 当快速查询覆盖已有值时提示用户
if (currentValues.location && searchParams.location) {
  message.warning(`地区从"${currentValues.location}"更改为"${searchParams.location}"`)
}
```

### 2. 条件组合建议

```typescript
// 根据已有条件智能推荐快速查询选项
if (currentValues.minScore >= 600) {
  // 高亮显示"985"、"211"快速查询按钮
}
```

### 3. 保存查询组合

```typescript
// 允许用户保存常用的查询组合
const saveQueryPreset = () => {
  const currentQuery = form.getFieldsValue()
  localStorage.setItem('queryPreset', JSON.stringify(currentQuery))
}
```

### 4. 查询历史

```typescript
// 记录用户的查询历史
const [queryHistory, setQueryHistory] = useState([])

const handleSearch = (values) => {
  setQueryHistory(prev => [values, ...prev].slice(0, 5))
  // 执行查询...
}
```

## 📊 对比总结

| 特性 | 修改前 | 修改后 |
|------|--------|--------|
| 保留已填条件 | ❌ 丢失 | ✅ 保留 |
| 快速查询效率 | ❌ 需重新填写 | ✅ 一键组合 |
| 用户体验 | ❌ 繁琐 | ✅ 便捷 |
| 操作步骤 | ❌ 多步 | ✅ 少步 |
| 灵活性 | ❌ 低 | ✅ 高 |

## 📄 相关文件

- `client/src/pages/GaokaoQuery.tsx` - 高考查询页面
- [Ant Design Form 文档](https://ant.design/components/form-cn/)

