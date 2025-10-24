import React, { useState } from 'react'
import { Form, Input, Button, Select, Table, message, Space, Typography, Row, Col } from 'antd'
import { SearchOutlined, BookOutlined, EnvironmentOutlined, StarOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select
const { Title, Paragraph } = Typography

interface UniversityData {
  id: string
  name: string
  location: string
  type: string
  level: string
  score: number
}

const GaokaoQuery: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<UniversityData[]>([])
  const [queryType, setQueryType] = useState<'university' | 'major'>('university')

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          {text}
        </div>
      )
    },
    {
      title: '地区',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: 'var(--primary-color)' }} />
          {text}
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '层次',
      dataIndex: 'level',
      key: 'level',
      render: (text: string) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          {text}
        </Space>
      )
    },
    {
      title: '参考分数',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => score ? (
        <div style={{ 
          color: 'var(--primary-color)', 
          fontWeight: 600,
          fontSize: '16px'
        }}>
          {score}分
        </div>
      ) : '-',
    },
  ]

  const handleSearch = async (values: any) => {
    setLoading(true)
    try {
      const endpoint = queryType === 'university' ? '/api/v1/gaokao/universities' : '/api/v1/gaokao/majors'
      const response = await axios.get(endpoint, { params: values })
      
      if (response.data.success) {
        setData(response.data.data || [])
        if (response.data.data?.length === 0) {
          message.info('未找到相关数据')
        }
      } else {
        message.error(response.data.message || '查询失败')
      }
    } catch (error) {
      console.error('查询失败:', error)
      message.error('查询失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    setData([])
  }

  const quickSearchOptions = [
    { label: '985高校', value: { level: '985' } },
    { label: '211高校', value: { level: '211' } },
    { label: '双一流', value: { level: '双一流' } },
    { label: '北京高校', value: { location: '北京' } },
    { label: '上海高校', value: { location: '上海' } },
    { label: '广东高校', value: { location: '广东' } }
  ]

  const handleQuickSearch = (searchParams: any) => {
    form.setFieldsValue(searchParams)
    handleSearch(searchParams)
  }

  return (
    <div className="gaokao-query-container">
      {/* 页面标题 */}
      <div className="glass-card" style={{ 
        textAlign: 'center', 
        padding: '40px',
        marginBottom: '24px',
        background: 'var(--bg-light)'
      }}>
        <BookOutlined style={{ fontSize: '48px', color: 'var(--primary-color)', marginBottom: '16px' }} />
        <Title level={2} style={{ 
          marginBottom: '16px',
          background: 'linear-gradient(135deg, var(--secondary-color), var(--accent-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          高考信息查询
        </Title>
        <Paragraph style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
          查询全国高校信息、专业详情、录取分数线等权威数据
        </Paragraph>
      </div>

      {/* 快速搜索 */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
          快速查询
        </Title>
        <Row gutter={[16, 16]}>
          {quickSearchOptions.map((option, index) => (
            <Col xs={12} sm={8} md={6} lg={4} key={index}>
              <Button
                block
                onClick={() => handleQuickSearch(option.value)}
                style={{
                  borderRadius: '20px',
                  border: '1px solid var(--border-medium)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
                className="quick-search-btn"
              >
                {option.label}
              </Button>
            </Col>
          ))}
        </Row>
      </div>
      
      {/* 搜索表单 */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="type" label="查询类型">
                <Select
                  value={queryType}
                  onChange={setQueryType}
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="university">高校查询</Option>
                  <Option value="major">专业查询</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="keyword" label="关键词">
                <Input 
                  placeholder={queryType === 'university' ? '输入高校名称' : '输入专业名称'} 
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="location" label="地区">
                <Select placeholder="选择地区" allowClear style={{ borderRadius: '8px' }}>
                  <Option value="北京">北京</Option>
                  <Option value="上海">上海</Option>
                  <Option value="广东">广东</Option>
                  <Option value="江苏">江苏</Option>
                  <Option value="浙江">浙江</Option>
                  <Option value="山东">山东</Option>
                  <Option value="湖北">湖北</Option>
                  <Option value="湖南">湖南</Option>
                  <Option value="四川">四川</Option>
                  <Option value="陕西">陕西</Option>
                </Select>
              </Form.Item>
            </Col>

            {queryType === 'university' && (
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="level" label="层次">
                  <Select placeholder="选择层次" allowClear style={{ borderRadius: '8px' }}>
                    <Option value="985">985</Option>
                    <Option value="211">211</Option>
                    <Option value="双一流">双一流</Option>
                    <Option value="本科">本科</Option>
                    <Option value="专科">专科</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row justify="center" style={{ marginTop: '16px' }}>
            <Col>
              <Space size="large">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SearchOutlined />}
                  loading={loading}
                  size="large"
                  style={{
                    borderRadius: '24px',
                    background: 'var(--primary-color)',
                    borderColor: 'var(--primary-color)',
                    boxShadow: '0 2px 8px rgba(0, 122, 255, 0.2)',
                    minWidth: '120px'
                  }}
                >
                  查询
                </Button>
                <Button 
                  onClick={handleReset}
                  size="large"
                  style={{
                    borderRadius: '24px',
                    minWidth: '120px'
                  }}
                >
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>

      {/* 结果表格 */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
            查询结果
          </Title>
          {data.length > 0 && (
            <div style={{ color: 'var(--text-muted)' }}>
              共找到 {data.length} 条记录
            </div>
          )}
        </div>
        
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条记录`,
            style: { marginTop: '16px' }
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <BookOutlined style={{ fontSize: '48px', color: 'var(--border-medium)', marginBottom: '16px' }} />
                <div style={{ color: 'var(--text-muted)' }}>
                  暂无数据，请输入查询条件进行搜索
                </div>
              </div>
            )
          }}
          style={{
            background: 'transparent'
          }}
        />
      </div>

      <style>{`
        .quick-search-btn:hover {
          border-color: var(--primary-color) !important;
          color: var(--primary-color) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
        }
        
        .ant-table {
          background: transparent !important;
        }
        
        .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.8) !important;
          border-bottom: 1px solid var(--border-light) !important;
          font-weight: 600 !important;
          color: var(--text-primary) !important;
        }
        
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid var(--border-light) !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background: rgba(0, 122, 255, 0.05) !important;
        }
      `}</style>
    </div>
  )
}

export default GaokaoQuery