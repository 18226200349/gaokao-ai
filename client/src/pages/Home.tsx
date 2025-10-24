import React from 'react'
import { Card, Row, Col, Typography, Button, Space } from 'antd'
import { MessageOutlined, BookOutlined, RobotOutlined, StarOutlined, ThunderboltOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

const Home: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <MessageOutlined style={{ fontSize: '48px', color: 'var(--primary-color)' }} />,
      title: 'AI智能聊天',
      description: '与AI助手进行自然对话，获取个性化的高考指导和建议，让每一个问题都有权威答案',
      action: () => navigate('/chat'),
      buttonText: '开始聊天',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: <BookOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: '高考信息查询',
      description: '查询全国高校信息、专业详情、录取分数线等权威高考数据，助力科学择校',
      action: () => navigate('/gaokao'),
      buttonText: '开始查询',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
    },
    {
      icon: <RobotOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      title: '智能推荐',
      description: '基于成绩、兴趣和职业规划，智能推荐最适合的高校和专业组合',
      action: () => navigate('/chat'),
      buttonText: '获取推荐',
      gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)'
    }
  ]

  const stats = [
    { icon: <StarOutlined />, number: '1000+', label: '权威高校数据' },
    { icon: <ThunderboltOutlined />, number: '24/7', label: '智能在线服务' },
    { icon: <HeartOutlined />, number: '99%', label: '用户满意度' }
  ]

  return (
    <div className="home-container">
      {/* 主标题区域 */}
      <div className="hero-section glass-card" style={{ 
        textAlign: 'center', 
        padding: '60px 40px',
        marginBottom: '40px',
        background: 'var(--bg-light)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          zIndex: 0
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <RobotOutlined style={{ fontSize: '72px', color: 'var(--primary-color)' }} />
          </div>
          <Title level={1} style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, var(--secondary-color), var(--accent-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            高考AI智能助手 🤖
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: 'var(--text-muted)', 
            maxWidth: '600px', 
            margin: '0 auto 32px',
            lineHeight: 1.8
          }}>
            让你的每一个问题，都有权威答案。为高考学子提供智能化的升学指导服务，助力科学择校，成就美好未来。
          </Paragraph>
          
          {/* 统计数据 */}
          <Row gutter={[32, 16]} justify="center" style={{ marginTop: '40px' }}>
            {stats.map((stat, index) => (
              <Col xs={8} sm={8} key={index}>
                <div className="slide-in" style={{ 
                  textAlign: 'center',
                  animationDelay: `${index * 0.2}s`
                }}>
                  <div style={{ fontSize: '24px', color: 'var(--primary-color)', marginBottom: '8px' }}>
                    {stat.icon}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {stat.number}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {stat.label}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* 功能卡片区域 */}
      <Row gutter={[24, 24]} justify="center">
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              className="glass-card feature-card slide-in"
              hoverable
              style={{ 
                height: '100%',
                textAlign: 'center',
                border: 'none',
                animationDelay: `${index * 0.2}s`,
                position: 'relative',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: '40px 24px', position: 'relative', zIndex: 1 }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: feature.gradient,
                opacity: 0.05,
                zIndex: 0
              }} />
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: 'var(--shadow-medium)',
                  transition: 'all 0.3s ease'
                }}>
                  {feature.icon}
                </div>
              </div>
              
              <Title level={3} style={{ 
                marginBottom: '16px',
                color: 'var(--text-primary)',
                fontSize: '20px',
                fontWeight: 600
              }}>
                {feature.title}
              </Title>
              
              <Paragraph style={{ 
                color: 'var(--text-muted)', 
                marginBottom: '32px', 
                minHeight: '72px',
                lineHeight: 1.6
              }}>
                {feature.description}
              </Paragraph>
              
              <Button 
                className="btn-primary"
                size="large" 
                onClick={feature.action}
                style={{ 
                  width: '100%',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                {feature.buttonText}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 底部行动号召 */}
      <div className="glass-card" style={{ 
        textAlign: 'center', 
        padding: '40px',
        marginTop: '40px',
        background: 'var(--bg-light)'
      }}>
        <Title level={3} style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
          准备好开始你的高考规划之旅了吗？
        </Title>
        <Paragraph style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          立即体验AI智能助手，获取专业的高考指导建议
        </Paragraph>
        <Space size="large">
          <Button 
            className="btn-primary"
            size="large"
            icon={<MessageOutlined />}
            onClick={() => navigate('/chat')}
          >
            开始聊天
          </Button>
          <Button 
            size="large"
            icon={<BookOutlined />}
            onClick={() => navigate('/gaokao')}
            style={{
              background: 'transparent',
              border: '2px solid var(--primary-color)',
              color: 'var(--primary-color)',
              borderRadius: '24px',
              fontWeight: 500
            }}
          >
            查询信息
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default Home