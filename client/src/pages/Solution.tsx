import React, { useState, useEffect, useRef } from 'react'
import { Card, Tabs, Button, Space, message, Tag, Typography, Row, Col, Modal, Descriptions } from 'antd'
import { 
  DownloadOutlined, 
  PrinterOutlined, 
  SaveOutlined, 
  CheckCircleOutlined,
  TrophyOutlined,
  StarOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  BookOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
// @ts-ignore
import html2canvas from 'html2canvas'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

interface UserInfo {
  province: string
  subject: string
  score: number
}

interface University {
  name: string
  location: string
  type: string
  level: string
  admissionScore: number
  probability: string
  majorRecommendations: string[]
  website?: string
}

interface Major {
  name: string
  category: string
  employmentRate: string
  averageSalary: string
  description: string
}

const Solution: React.FC = () => {
  const navigate = useNavigate()
  const solutionRef = useRef<HTMLDivElement>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [estimatedRank, setEstimatedRank] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('stable')
  const [stableUniversities, setStableUniversities] = useState<University[]>([])
  const [moderateUniversities, setModerateUniversities] = useState<University[]>([])
  const [reachUniversities, setReachUniversities] = useState<University[]>([])
  const [recommendedMajors, setRecommendedMajors] = useState<Major[]>([])
  const [universityModalVisible, setUniversityModalVisible] = useState(false)
  const [majorModalVisible, setMajorModalVisible] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // 防止React.StrictMode导致的重复调用
    if (hasLoadedRef.current) {
      return
    }
    hasLoadedRef.current = true
    
    // 从localStorage加载用户信息
    const savedInfo = localStorage.getItem('gaokao_user_info')
    if (savedInfo) {
      const info = JSON.parse(savedInfo)
      setUserInfo(info)
      
      // 估算位次
      const rank = estimateRank(info.score)
      setEstimatedRank(rank)
      
      // 生成推荐方案
      generateRecommendations(info)
    } else {
      message.warning('未找到用户信息，请先填写基本信息')
      navigate('/chat')
    }
  }, [navigate])
  
  // 监控状态变化
  useEffect(() => {
  }, [stableUniversities, moderateUniversities, reachUniversities])

  // 估算位次
  const estimateRank = (score: number): number => {
    // 简化的位次估算算法
    const baseRank = Math.max(1, Math.floor((750 - score) * 100))
    return baseRank
  }

  // 生成推荐方案
  const generateRecommendations = async (info: UserInfo) => {
    try {
      // 调用后端推荐接口
      const response = await fetch(
          `/api/v1/gaokao/universities/recommend?score=${info.score}&province=${encodeURIComponent(info.province)}&subject=${encodeURIComponent(info.subject)}`
        )
      
      if (!response.ok) {
        throw new Error('获取推荐数据失败')
      }
      
      const result = await response.json()
      
      
      if (result.success && result.data) {
        // 转换后端数据格式到前端格式
        const convertToFrontendFormat = (universities: any[], type: string): University[] => {
          const converted = universities.map(uni => {
            // 计算录取概率
            let probability = '未知'
            if (type === 'safe') {
              probability = '85%'
            } else if (type === 'moderate') {
              probability = '60%'
            } else if (type === 'reach') {
              probability = '30%'
            }
            
            // 处理location字段,可能是字符串或对象
            let locationStr = '未知'
            if (uni.geographical_location) {
              if (typeof uni.geographical_location === 'string') {
                locationStr = uni.geographical_location
              } else if (typeof uni.geographical_location === 'object') {
                // 如果是对象,提取province字段
                locationStr = uni.geographical_location.province || uni.geographical_location.city || '未知'
              }
            } else if (uni.location) {
              if (typeof uni.location === 'string') {
                locationStr = uni.location
              } else if (typeof uni.location === 'object') {
                locationStr = uni.location.province || uni.location.city || '未知'
              }
            }
            
            const formatted = {
              name: uni.name,
              location: locationStr,
              type: uni.type || '综合',
              level: uni.level || '本科',
              admissionScore: uni.cutoff_score || uni.score || 0,
              probability,
              majorRecommendations: uni.key_disciplines?.slice(0, 3) || uni.major_recommendations || [],
              website: uni.website || uni.official_website || uni.url || `https://www.baidu.com/s?wd=${encodeURIComponent(uni.name)}官网`
            }
            return formatted
          })
          return converted
        }
        
        const safeData = convertToFrontendFormat(result.data.safe || [], 'safe')
        const moderateData = convertToFrontendFormat(result.data.moderate || [], 'moderate')
        const reachData = convertToFrontendFormat(result.data.reach || [], 'reach')
        
        
        setStableUniversities(safeData)
        setModerateUniversities(moderateData)
        setReachUniversities(reachData)
        
      } else {
        throw new Error(result.message || '获取推荐数据失败')
      }
    } catch (error) {
      message.error('获取推荐数据失败,使用默认方案')
      
      // 降级到模拟数据
      const stable = generateUniversityList(info.score - 25, info.score - 15, info.province, '稳妥')
      setStableUniversities(stable)
      const moderate = generateUniversityList(info.score - 10, info.score + 10, info.province, '适中')
      setModerateUniversities(moderate)
      const reach = generateUniversityList(info.score + 10, info.score + 20, info.province, '冲刺')
      setReachUniversities(reach)
    }
    
    // 生成专业推荐
    const majors = generateMajors(info.subject)
    setRecommendedMajors(majors)
  }

  // 生成院校列表
  const generateUniversityList = (
    minScore: number, 
    maxScore: number, 
    _province: string, 
    type: string
  ): University[] => {
    const universities: University[] = []
    const universityTemplates = [
      { name: '清华大学', location: '北京', type: '综合', level: '985/211/双一流' },
      { name: '北京大学', location: '北京', type: '综合', level: '985/211/双一流' },
      { name: '复旦大学', location: '上海', type: '综合', level: '985/211/双一流' },
      { name: '上海交通大学', location: '上海', type: '综合', level: '985/211/双一流' },
      { name: '浙江大学', location: '浙江', type: '综合', level: '985/211/双一流' },
      { name: '南京大学', location: '江苏', type: '综合', level: '985/211/双一流' },
      { name: '中国科学技术大学', location: '安徽', type: '理工', level: '985/211/双一流' },
      { name: '哈尔滨工业大学', location: '黑龙江', type: '理工', level: '985/211/双一流' },
      { name: '西安交通大学', location: '陕西', type: '综合', level: '985/211/双一流' },
      { name: '武汉大学', location: '湖北', type: '综合', level: '985/211/双一流' }
    ]

    const count = type === '稳妥' ? 8 : type === '适中' ? 10 : 6
    
    for (let i = 0; i < count; i++) {
      const template = universityTemplates[i % universityTemplates.length]
      const score = Math.floor(minScore + (maxScore - minScore) * Math.random())
      const probability = type === '稳妥' ? '85%' : type === '适中' ? '60%' : '30%'
      
      universities.push({
        ...template,
        name: `${template.name}${i > 0 ? '' : ''}`,
        admissionScore: score,
        probability,
        majorRecommendations: ['计算机科学与技术', '软件工程', '人工智能'],
        website: `https://www.baidu.com/s?wd=${encodeURIComponent(template.name)}官网`
      })
    }

    return universities
  }

  // 生成专业推荐
  const generateMajors = (subject: string): Major[] => {
    const scienceMajors: Major[] = [
      {
        name: '计算机科学与技术',
        category: '工学',
        employmentRate: '96.5%',
        averageSalary: '12000元/月',
        description: '培养具有计算机科学理论基础和应用开发能力的高级专门人才'
      },
      {
        name: '人工智能',
        category: '工学',
        employmentRate: '97.2%',
        averageSalary: '15000元/月',
        description: '培养AI领域的研究和应用型人才，就业前景广阔'
      },
      {
        name: '软件工程',
        category: '工学',
        employmentRate: '95.8%',
        averageSalary: '11000元/月',
        description: '培养软件开发、测试和管理的专业人才'
      },
      {
        name: '电子信息工程',
        category: '工学',
        employmentRate: '94.5%',
        averageSalary: '10000元/月',
        description: '培养电子信息领域的工程技术人才'
      },
      {
        name: '自动化',
        category: '工学',
        employmentRate: '93.2%',
        averageSalary: '9500元/月',
        description: '培养工业自动化和智能控制领域的专业人才'
      }
    ]

    const artsMajors: Major[] = [
      {
        name: '金融学',
        category: '经济学',
        employmentRate: '92.5%',
        averageSalary: '11000元/月',
        description: '培养金融领域的专业人才，就业面广'
      },
      {
        name: '法学',
        category: '法学',
        employmentRate: '88.5%',
        averageSalary: '9000元/月',
        description: '培养法律专业人才，适合从事律师、法官等职业'
      },
      {
        name: '国际经济与贸易',
        category: '经济学',
        employmentRate: '90.2%',
        averageSalary: '8500元/月',
        description: '培养国际贸易领域的专业人才'
      },
      {
        name: '汉语言文学',
        category: '文学',
        employmentRate: '87.8%',
        averageSalary: '7500元/月',
        description: '培养文学创作和语言教育人才'
      },
      {
        name: '新闻传播学',
        category: '文学',
        employmentRate: '89.5%',
        averageSalary: '8000元/月',
        description: '培养新闻媒体和传播领域的专业人才'
      }
    ]

    return subject === '理科' ? scienceMajors : artsMajors
  }

  // 渲染院校卡片
  const renderUniversityCard = (university: University, index: number) => (
    <Card
      key={index}
      hoverable
      style={{
        marginBottom: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease'
      }}
      onClick={() => showUniversityDetail(university)}
    >
      <Row gutter={16} align="middle">
        <Col span={1}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {index + 1}
          </div>
        </Col>
        <Col span={10}>
          <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
            {university.name}
          </Title>
          <Space size={8}>
            <Tag icon={<EnvironmentOutlined />} color="blue">
              {university.location}
            </Tag>
            <Tag color="purple">{university.type}</Tag>
            <Tag color="gold">{university.level}</Tag>
          </Space>
        </Col>
        <Col span={6}>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>录取分数线</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {university.admissionScore}
            </div>
          </div>
        </Col>
        <Col span={5}>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>录取概率</Text>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
              {university.probability}
            </div>
          </div>
        </Col>
        <Col span={2}>
          <Button type="link" onClick={(e) => {
            e.stopPropagation()
            showUniversityDetail(university)
          }}>
            详情
          </Button>
        </Col>
      </Row>
    </Card>
  )

  // 渲染专业卡片
  const renderMajorCard = (major: Major, index: number) => (
    <Card
      key={index}
      hoverable
      style={{
        marginBottom: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
      onClick={() => showMajorDetail(major)}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Title level={5} style={{ margin: 0, marginBottom: '8px' }}>
            <BookOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            {major.name}
          </Title>
          <Tag color="geekblue">{major.category}</Tag>
        </Col>
        <Col span={6}>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>就业率</Text>
          <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>{major.employmentRate}</Text>
        </Col>
        <Col span={6}>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>平均薪资</Text>
          <Text strong style={{ fontSize: '16px', color: '#fa8c16' }}>{major.averageSalary}</Text>
        </Col>
      </Row>
      <Paragraph style={{ marginTop: '12px', marginBottom: 0, color: '#666' }}>
        {major.description}
      </Paragraph>
    </Card>
  )

  // 显示院校详情
  const showUniversityDetail = (university: University) => {
    setSelectedUniversity(university)
    setUniversityModalVisible(true)
  }

  // 显示专业详情
  const showMajorDetail = (major: Major) => {
    setSelectedMajor(major)
    setMajorModalVisible(true)
  }

  // 导出方案为PNG图片
  const exportSolution = async () => {
    if (!solutionRef.current) {
      message.error('无法获取方案内容')
      return
    }

    try {
      message.loading({ content: '正在生成图片...', key: 'export', duration: 0 })
      
      // 使用html2canvas将DOM转换为canvas
      const canvas = await html2canvas(solutionRef.current, {
        backgroundColor: '#f5f5f5',
        scale: 2, // 提高清晰度
        useCORS: true,
        logging: false,
        windowWidth: solutionRef.current.scrollWidth,
        windowHeight: solutionRef.current.scrollHeight
      })

      // 将canvas转换为图片
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `志愿填报方案_${userInfo?.province}_${userInfo?.score}分_${new Date().getTime()}.png`
          link.click()
          URL.revokeObjectURL(url)
          
          message.success({ content: '方案导出成功！', key: 'export' })
          showNotification('方案已保存为图片', 'success')
        } else {
          message.error({ content: '导出失败', key: 'export' })
        }
      }, 'image/png')
    } catch (error) {
      message.error({ content: '导出失败，请重试', key: 'export' })
    }
  }

  // 打印方案
  const printSolution = () => {
    window.print()
    showNotification('准备打印...', 'info')
  }

  // 保存方案
  const saveSolution = () => {
    const solutionData = {
      userInfo,
      estimatedRank,
      stableUniversities,
      moderateUniversities,
      reachUniversities,
      recommendedMajors,
      saveTime: new Date().toLocaleString()
    }
    localStorage.setItem('savedSolution', JSON.stringify(solutionData))
    showNotification('方案保存成功！', 'success')
  }

  // 一键办理
  const quickApply = () => {
    showNotification('功能开发中，敬请期待！', 'info')
  }

  // 显示通知
  const showNotification = (content: string, type: 'success' | 'info' | 'warning' | 'error') => {
    message[type](content)
  }

  if (!userInfo) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Text>加载中...</Text>
      </div>
    )
  }


  return (
    <div 
      ref={solutionRef}
      className="solution-container" 
      style={{
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}
    >
      {/* 页面标题 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white'
      }}>
        <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '10px' }}>
          🎓 志愿填报方案
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
          基于您的成绩和意向，为您量身定制的志愿填报建议
        </Text>
      </div>

      {/* 基本信息卡片 */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Title level={4} style={{ marginBottom: '20px' }}>
          <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          基本信息
        </Title>
        <Row gutter={24}>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>所在省份</Text>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{userInfo.province}</Title>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>科类</Text>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>{userInfo.subject}</Title>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>高考分数</Text>
              <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>{userInfo.score}分</Title>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>估算位次</Text>
              <Title level={3} style={{ margin: 0, color: '#eb2f96' }}>{estimatedRank}</Title>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 推荐院校方案 */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Title level={4} style={{ marginBottom: '20px' }}>
          <TrophyOutlined style={{ marginRight: '8px', color: '#faad14' }} />
          推荐院校方案
        </Title>
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => {
            setActiveTab(key)
            // 标签页切换时可以触发数据刷新或其他操作
          }}
          type="card"
          size="large"
        >
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                稳妥院校 ({stableUniversities.length}所)
              </span>
            }
            key="stable"
          >
            <div style={{ padding: '16px' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                这些院校的录取分数线低于您的成绩，录取概率较高（85%以上）
              </Text>
              {(() => {
                return null
              })()}
              {stableUniversities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无推荐院校</div>
              ) : (
                stableUniversities.map((uni, index) => renderUniversityCard(uni, index))
              )}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <StarOutlined />
                适中院校 ({moderateUniversities.length}所)
              </span>
            }
            key="moderate"
          >
            <div style={{ padding: '16px' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                这些院校的录取分数线接近您的成绩，有一定录取机会（60%左右）
              </Text>
              {(() => {
                return null
              })()}
              {moderateUniversities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无推荐院校</div>
              ) : (
                moderateUniversities.map((uni, index) => renderUniversityCard(uni, index))
              )}
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <RocketOutlined />
                冲刺院校 ({reachUniversities.length}所)
              </span>
            }
            key="reach"
          >
            <div style={{ padding: '16px' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>  
                这些院校的录取分数线高于您的成绩，可以尝试冲刺（30%左右）
              </Text>
              {(() => {
                return null
              })()}
              {reachUniversities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无推荐院校</div>
              ) : (
                reachUniversities.map((uni, index) => renderUniversityCard(uni, index))
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 推荐专业 */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Title level={4} style={{ marginBottom: '20px' }}>
          <BookOutlined style={{ marginRight: '8px', color: '#13c2c2' }} />
          推荐专业
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
          根据您的科类和当前就业市场，为您推荐以下热门专业
        </Text>
        {recommendedMajors.map((major, index) => renderMajorCard(major, index))}
      </Card>

      {/* 填报建议 */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        }}
      >
        <Title level={4} style={{ marginBottom: '20px' }}>
          💡 填报建议
        </Title>
        <div style={{ lineHeight: '2' }}>
          <Paragraph>
            <Text strong>1. 梯度填报：</Text>
            建议按照"冲一冲、稳一稳、保一保"的原则，合理安排志愿顺序。
          </Paragraph>
          <Paragraph>
            <Text strong>2. 专业选择：</Text>
            优先考虑自己的兴趣和职业规划，不要盲目追求热门专业。
          </Paragraph>
          <Paragraph>
            <Text strong>3. 地域因素：</Text>
            考虑未来的就业和发展，可以适当关注经济发达地区的院校。
          </Paragraph>
          <Paragraph>
            <Text strong>4. 服从调剂：</Text>
            建议勾选"服从专业调剂"，可以大大降低被退档的风险。
          </Paragraph>
        </div>
      </Card>

      {/* 注意事项 */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          background: '#fff7e6',
          border: '1px solid #ffd591'
        }}
      >
        <Title level={4} style={{ marginBottom: '20px', color: '#fa8c16' }}>
          ⚠️ 注意事项
        </Title>
        <ul style={{ lineHeight: '2', marginBottom: 0 }}>
          <li>请仔细阅读各高校的招生章程，了解特殊要求</li>
          <li>注意专业的身体条件限制、单科成绩要求等</li>
          <li>关注填报时间，避免错过志愿填报截止日期</li>
          <li>建议服从专业调剂，增加录取机会</li>
          <li>填报后及时关注录取动态，做好征集志愿准备</li>
        </ul>
      </Card>

      {/* 操作按钮 */}
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            size="large"
            onClick={exportSolution}
            style={{
              borderRadius: '8px',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px'
            }}
          >
            导出方案
          </Button>
          <Button 
            icon={<PrinterOutlined />}
            size="large"
            onClick={printSolution}
            style={{
              borderRadius: '8px',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px'
            }}
          >
            打印方案
          </Button>
          <Button 
            icon={<SaveOutlined />}
            size="large"
            onClick={saveSolution}
            style={{
              borderRadius: '8px',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px'
            }}
          >
            保存方案
          </Button>
          <Button 
            type="primary"
            size="large"
            onClick={quickApply}
            style={{
              borderRadius: '8px',
              height: '48px',
              padding: '0 32px',
              fontSize: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            一键办理
          </Button>
        </Space>
      </Card>

      {/* 院校详情弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrophyOutlined style={{ color: 'var(--primary-color)' }} />
            <span>院校详情</span>
          </div>
        }
        open={universityModalVisible}
        onCancel={() => setUniversityModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedUniversity && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="院校名称" span={2}>
              <Text strong style={{ fontSize: '16px' }}>{selectedUniversity.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="地区">
              <Space>
                <EnvironmentOutlined />
                {selectedUniversity.location}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              {selectedUniversity.type}
            </Descriptions.Item>
            <Descriptions.Item label="层次" span={2}>
              <Space wrap>
                {selectedUniversity.level.split('/').map((l, i) => (
                  <Tag key={i} color="gold" icon={<StarOutlined />}>
                    {l}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="录取分数线">
              <Text strong style={{ fontSize: '18px', color: 'var(--primary-color)' }}>
                {selectedUniversity.admissionScore}分
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="录取概率">
              <Tag 
                color={
                  selectedUniversity.probability === '85%' ? 'green' :
                  selectedUniversity.probability === '60%' ? 'orange' : 'red'
                }
                style={{ fontSize: '16px', padding: '4px 12px' }}
              >
                {selectedUniversity.probability}
              </Tag>
            </Descriptions.Item>
            {selectedUniversity.majorRecommendations && selectedUniversity.majorRecommendations.length > 0 && (
              <Descriptions.Item label="推荐专业" span={2}>
                <Space wrap>
                  {selectedUniversity.majorRecommendations.map((major, i) => (
                    <Tag key={i} color="blue">{major}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="填报建议" span={2}>
              <div style={{ lineHeight: '1.8' }}>
                {selectedUniversity.probability === '85%' && (
                  <Text>
                    这是一所<Text strong style={{ color: '#52c41a' }}>稳妥院校</Text>，
                    您的分数高于该校录取分数线，录取概率很高。建议作为保底志愿填报。
                  </Text>
                )}
                {selectedUniversity.probability === '60%' && (
                  <Text>
                    这是一所<Text strong style={{ color: '#fa8c16' }}>适中院校</Text>，
                    您的分数接近该校录取分数线，有较大录取机会。建议作为主要志愿填报。
                  </Text>
                )}
                {selectedUniversity.probability === '30%' && (
                  <Text>
                    这是一所<Text strong style={{ color: '#ff4d4f' }}>冲刺院校</Text>，
                    该校录取分数线高于您的成绩，可以尝试冲刺，但需要做好备选方案。
                  </Text>
                )}
              </div>
            </Descriptions.Item>
            {selectedUniversity.website && (
              <Descriptions.Item label="官方网站" span={2}>
                <a href={selectedUniversity.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>
                  {selectedUniversity.website}
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 专业详情弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOutlined style={{ color: 'var(--primary-color)' }} />
            <span>专业详情</span>
          </div>
        }
        open={majorModalVisible}
        onCancel={() => setMajorModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedMajor && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="专业名称" span={2}>
              <Text strong style={{ fontSize: '16px' }}>{selectedMajor.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="类别">
              <Tag color="blue">{selectedMajor.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="就业率">
              <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                <PercentageOutlined /> {selectedMajor.employmentRate}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="平均薪资" span={2}>
              <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                <DollarOutlined /> {selectedMajor.averageSalary}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="专业介绍" span={2}>
              <Paragraph style={{ marginBottom: 0 }}>
                {selectedMajor.description}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="就业前景" span={2}>
              <div style={{ lineHeight: '1.8' }}>
                <Paragraph>
                  该专业就业率达到 <Text strong style={{ color: '#52c41a' }}>{selectedMajor.employmentRate}</Text>，
                  平均薪资为 <Text strong style={{ color: '#ff4d4f' }}>{selectedMajor.averageSalary}</Text>，
                  就业前景良好。
                </Paragraph>
                <Paragraph style={{ marginBottom: 0 }}>
                  <Text type="secondary">
                    建议根据个人兴趣和职业规划选择专业，不要盲目追求热门专业。
                  </Text>
                </Paragraph>
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <style>{`
        @media print {
          .solution-container {
            padding: 0;
          }
          button {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .solution-container {
            padding: 12px !important;
          }
          
          .ant-card {
            margin-bottom: 16px !important;
          }
          
          .ant-space {
            flex-direction: column !important;
            width: 100% !important;
          }
          
          .ant-space .ant-btn {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Solution