import React, { useState } from 'react'
import { Form, Input, Button, Select, Table, message, Space, Typography, Row, Col, Modal, Tag, Descriptions, InputNumber } from 'antd'
import { SearchOutlined, BookOutlined, EnvironmentOutlined, StarOutlined, TrophyOutlined, DollarOutlined, PercentageOutlined, InfoCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select
const { Title, Paragraph, Text } = Typography

interface UniversityData {
  id: string
  name: string
  location: string
  type: string
  level: string
  score: number | null
  ranking: number | null
  website: string
  keyDisciplines: string[]
  admissionRate: number | null
}

interface MajorData {
  id: string
  name: string
  code: string
  category: string
  type: string
  level: string
  description: string
  employmentRate: number | null
  averageSalary: number | null
  topUniversities: string[]
}

const GaokaoQuery: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<(UniversityData | MajorData)[]>([])
  const [queryType, setQueryType] = useState<'university' | 'major'>('university')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UniversityData | MajorData | null>(null)
  const [searchProvince, setSearchProvince] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 高校列表列定义
  const universityColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {text}
          </div>
          {record.ranking && (
            <Tag color="gold" icon={<TrophyOutlined />}>
              全国第{record.ranking}名
            </Tag>
          )}
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
      title: '类型/层次',
      key: 'typeLevel',
      render: (record: any) => (
        <div>
          <div style={{ marginBottom: '4px' }}>{record.type}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.level}
          </Text>
        </div>
      )
    },
    {
      title: '分数线',
      dataIndex: 'score',
      key: 'score',
      sorter: (a: any, b: any) => (a.score || 0) - (b.score || 0),
      render: (score: number) => score ? (
        <div style={{ 
          color: 'var(--primary-color)', 
          fontWeight: 600,
          fontSize: '16px'
        }}>
          {score}分
        </div>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <Button 
          type="link" 
          icon={<InfoCircleOutlined />}
          onClick={() => showDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ]

  // 专业列表列定义
  const majorColumns = [
    {
      title: '专业名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {text}
          </div>
          {record.code && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              代码：{record.code}
            </Text>
          )}
        </div>
      )
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      )
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
      title: '就业率',
      dataIndex: 'employmentRate',
      key: 'employmentRate',
      sorter: (a: any, b: any) => (a.employmentRate || 0) - (b.employmentRate || 0),
      render: (rate: number) => rate ? (
        <div style={{ color: '#52c41a', fontWeight: 500 }}>
          <PercentageOutlined /> {(rate * 100).toFixed(1)}%
        </div>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: '平均薪资',
      dataIndex: 'averageSalary',
      key: 'averageSalary',
      sorter: (a: any, b: any) => (a.averageSalary || 0) - (b.averageSalary || 0),
      render: (salary: number) => salary ? (
        <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
          <DollarOutlined /> {salary}元/月
        </div>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <Button 
          type="link" 
          icon={<InfoCircleOutlined />}
          onClick={() => showDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ]

  const showDetail = (item: any) => {
    setSelectedItem(item)
    setDetailModalVisible(true)
  }

  const handleSearch = async (values: any) => {
    setLoading(true)
    try {
      const endpoint = queryType === 'university' ? '/api/v1/gaokao/universities' : '/api/v1/gaokao/majors'
      
      // 构建查询参数
      const params: any = {}
      if (values.keyword) params.keyword = values.keyword
      if (values.location) params.location = values.location
      if (values.level) params.level = values.level
      if (values.category) params.category = values.category
      if (values.province) {
        params.province = values.province
        setSearchProvince(values.province)
      }
      if (values.minScore) params.minScore = values.minScore
      if (values.maxScore) params.maxScore = values.maxScore
      
      const response = await axios.get(endpoint, { params })
      
      if (response.data.success) {
        setData(response.data.data || [])
        setCurrentPage(1) // 新查询结果，重置到第一页
        if (response.data.data?.length === 0) {
          message.info('未找到相关数据')
        } else {
          message.success(`找到 ${response.data.data.length} 条记录`)
        }
      } else {
        message.error(response.data.message || '查询失败')
        setData([])
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('查询失败:', error)
      message.error('查询失败，请稍后重试')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    setData([])
    setCurrentPage(1)
    setPageSize(10)
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
              <Form.Item label="查询类型">
                <Select
                  value={queryType}
                  onChange={(value) => {
                    setQueryType(value)
                    form.resetFields()
                    setData([])
                    setCurrentPage(1)
                    setPageSize(10)
                  }}
                  style={{ borderRadius: '8px' }}
                  placeholder="选择查询类型"
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
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>

            {queryType === 'university' && (
              <>
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
                      <Option value="河南">河南</Option>
                      <Option value="河北">河北</Option>
                      <Option value="辽宁">辽宁</Option>
                      <Option value="天津">天津</Option>
                      <Option value="重庆">重庆</Option>
                    </Select>
                  </Form.Item>
                </Col>

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

                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="province" label="查询省份（分数线）">
                    <Select placeholder="选择省份" allowClear style={{ borderRadius: '8px' }}>
                      <Option value="北京市">北京</Option>
                      <Option value="上海市">上海</Option>
                      <Option value="广东省">广东</Option>
                      <Option value="江苏省">江苏</Option>
                      <Option value="浙江省">浙江</Option>
                      <Option value="山东省">山东</Option>
                      <Option value="湖北省">湖北</Option>
                      <Option value="湖南省">湖南</Option>
                      <Option value="四川省">四川</Option>
                      <Option value="陕西省">陕西</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="minScore" label="最低分数线">
                    <InputNumber 
                      placeholder="最低分" 
                      style={{ width: '100%', borderRadius: '8px' }}
                      min={0}
                      max={750}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="maxScore" label="最高分数线">
                    <InputNumber 
                      placeholder="最高分" 
                      style={{ width: '100%', borderRadius: '8px' }}
                      min={0}
                      max={750}
                    />
                  </Form.Item>
                </Col>
              </>
            )}

            {queryType === 'major' && (
              <>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="category" label="专业类别">
                    <Select placeholder="选择类别" allowClear style={{ borderRadius: '8px' }}>
                      <Option value="工学">工学</Option>
                      <Option value="理学">理学</Option>
                      <Option value="医学">医学</Option>
                      <Option value="文学">文学</Option>
                      <Option value="经济学">经济学</Option>
                      <Option value="管理学">管理学</Option>
                      <Option value="法学">法学</Option>
                      <Option value="教育学">教育学</Option>
                      <Option value="农学">农学</Option>
                      <Option value="艺术学">艺术学</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="level" label="学历层次">
                    <Select placeholder="选择层次" allowClear style={{ borderRadius: '8px' }}>
                      <Option value="本科">本科</Option>
                      <Option value="专科">专科</Option>
                      <Option value="硕士">硕士</Option>
                      <Option value="博士">博士</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </>
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
          columns={queryType === 'university' ? universityColumns : majorColumns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, size) => {
              setCurrentPage(page)
              if (size !== pageSize) {
                setPageSize(size)
                setCurrentPage(1) // 切换每页条数时回到第一页
              }
            },
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

      {/* 详情弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOutlined style={{ color: 'var(--primary-color)' }} />
            <span>{queryType === 'university' ? '高校详情' : '专业详情'}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedItem && queryType === 'university' && 'ranking' in selectedItem && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="名称" span={2}>
              <Text strong style={{ fontSize: '16px' }}>{selectedItem.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="地区">
              <Space>
                <EnvironmentOutlined />
                {selectedItem.location}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              {selectedItem.type}
            </Descriptions.Item>
            <Descriptions.Item label="层次" span={2}>
              <Space wrap>
                {selectedItem.level.split('/').map((l, i) => (
                  <Tag key={i} color="gold" icon={<StarOutlined />}>
                    {l}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            {selectedItem.ranking && (
              <Descriptions.Item label="全国排名">
                <Tag color="gold" icon={<TrophyOutlined />}>
                  第{selectedItem.ranking}名
                </Tag>
              </Descriptions.Item>
            )}
            {selectedItem.score && (
              <Descriptions.Item label={`${searchProvince || '参考'}分数线`}>
                <Text strong style={{ fontSize: '18px', color: 'var(--primary-color)' }}>
                  {selectedItem.score}分
                </Text>
              </Descriptions.Item>
            )}
            {selectedItem.admissionRate && (
              <Descriptions.Item label="录取率" span={2}>
                <Text style={{ color: '#52c41a' }}>
                  {(selectedItem.admissionRate * 100).toFixed(2)}%
                </Text>
              </Descriptions.Item>
            )}
            {selectedItem.keyDisciplines && selectedItem.keyDisciplines.length > 0 && (
              <Descriptions.Item label="重点学科" span={2}>
                <Space wrap>
                  {selectedItem.keyDisciplines.map((discipline, i) => (
                    <Tag key={i} color="blue">{discipline}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
            {selectedItem.website && (
              <Descriptions.Item label="官方网站" span={2}>
                <a href={selectedItem.website} target="_blank" rel="noopener noreferrer">
                  {selectedItem.website}
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        {selectedItem && queryType === 'major' && 'employmentRate' in selectedItem && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="专业名称" span={2}>
              <Text strong style={{ fontSize: '16px' }}>{selectedItem.name}</Text>
            </Descriptions.Item>
            {'code' in selectedItem && selectedItem.code && (
              <Descriptions.Item label="专业代码">
                {selectedItem.code}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="类别">
              <Tag color="blue">{selectedItem.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="学历层次" span={2}>
              <Space wrap>
                {selectedItem.level.split('/').map((l, i) => (
                  <Tag key={i} color="green" icon={<StarOutlined />}>
                    {l}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            {selectedItem.description && (
              <Descriptions.Item label="专业介绍" span={2}>
                {selectedItem.description}
              </Descriptions.Item>
            )}
            {selectedItem.employmentRate && (
              <Descriptions.Item label="就业率">
                <Text strong style={{ color: '#52c41a' }}>
                  <PercentageOutlined /> {(selectedItem.employmentRate * 100).toFixed(1)}%
                </Text>
              </Descriptions.Item>
            )}
            {selectedItem.averageSalary && (
              <Descriptions.Item label="平均薪资">
                <Text strong style={{ color: '#ff4d4f' }}>
                  <DollarOutlined /> {selectedItem.averageSalary}元/月
                </Text>
              </Descriptions.Item>
            )}
            {selectedItem.topUniversities && selectedItem.topUniversities.length > 0 && (
              <Descriptions.Item label="推荐高校" span={2}>
                <Space wrap>
                  {selectedItem.topUniversities.map((university, i) => (
                    <Tag key={i} color="purple">{university}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

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