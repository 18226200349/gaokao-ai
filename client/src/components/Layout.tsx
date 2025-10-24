import React, { useState, useEffect } from 'react'
import { Layout as AntLayout, Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { HomeOutlined, MessageOutlined, BookOutlined, RobotOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: <Link to="/chat">AI聊天</Link>,
    },
    {
      key: '/gaokao',
      icon: <BookOutlined />,
      label: <Link to="/gaokao">高考查询</Link>,
    },
  ]

  return (
    <AntLayout className="app-layout">
      {!isMobile && (
        <Header className="app-header">
          <div className="header-content">
            <div className="logo">
              <RobotOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
              <h1>高考AI智能助手</h1>
            </div>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
            />
          </div>
        </Header>
      )}
      <Content className={`app-content fade-in ${isMobile ? 'mobile-content' : ''}`}>
        {children}
      </Content>
      {!isMobile && (
        <Footer className="app-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <RobotOutlined />
            <span>高考AI助手 ©2025 让每一个问题都有权威答案</span>
          </div>
        </Footer>
      )}
      
      {/* 移动端底部导航 */}
      {isMobile && (
        <div className="mobile-bottom-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.key} 
              to={item.key}
              className={`nav-item ${location.pathname === item.key ? 'active' : ''}`}
            >
              {item.icon}
              <span>{typeof item.label === 'object' && 'props' in item.label ? item.label.props.children : item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </AntLayout>
  )
}

export default Layout
