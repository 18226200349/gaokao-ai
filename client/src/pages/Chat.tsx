import React, { useState, useRef, useEffect } from 'react'
import { Input, Button, List, Avatar, Typography, Space, message, Select, Radio } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, ClearOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

const { TextArea } = Input
const { Text } = Typography
const { Option } = Select

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const Chat: React.FC = () => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: '欢迎使用【高考AI聊天助手】！请输入您的问题,我将为您提供帮助。',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [province, setProvince] = useState('北京')
  const [subject, setSubject] = useState('理科')
  const [score, setScore] = useState<number | undefined>(undefined)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const provinces = [
    '北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川', '湖北', '湖南',
    '河北', '安徽', '福建', '江西', '陕西', '山西', '重庆', '云南', '辽宁', '黑龙江',
    '广西', '贵州', '甘肃', '内蒙古', '海南', '宁夏', '青海', '新疆', '西藏', '天津',
    '吉林', '台湾', '香港', '澳门'
  ]

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    const trimmedInput = inputValue.trim()
    
    // 检查必填项
    if (!province) {
      alert('请选择省份')
      return
    }
    if (!subject) {
      alert('请选择文理科')
      return
    }
    if (!score || score < 0 || score > 750) {
      alert('请输入考生分数')
      return
    }
    
    // 如果没有输入内容，构造默认消息
    let displayText = trimmedInput
    if (!displayText) {
      displayText = `我想了解${province}${subject}${score}分的高考志愿报名`
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: displayText,
      isUser: true,
      timestamp: new Date()
    }

    // 添加AI思考中的消息
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'thinking',
      isUser: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, thinkingMessage])
    setInputValue('')
    setLoading(true)

    try {
      // 根据选择的文理科设置兴趣标签
      const interests = subject === '理科' ? ['理工'] : ['文史']
      
      // 构造问题文本，包含省份、文理科和分数信息
      let questionText = trimmedInput
      if (!questionText) {
        questionText = `我想了解${province}${subject}${score}分的高考志愿报名`
      }
      
      const response = await axios.post('/api/v1/chat', {
        question: questionText,
        province: province,
        userInfo: {
          province: province,
          schoolProvince: province
        },
        interests: interests,
        subject: subject,
        score: score,
        conversationHistory: conversationHistory
      })

      const aiMessage: Message = {
        id: thinkingMessage.id, // 使用相同的ID替换thinking消息
        content: response.data.data.reply || '抱歉，我现在无法回答这个问题。',
        isUser: false,
        timestamp: new Date()
      }

      // 替换最后一条thinking消息为AI回复
      setMessages(prev => {
        const newMessages = [...prev]
        const lastIndex = newMessages.length - 1
        if (newMessages[lastIndex]?.content === 'thinking') {
          newMessages[lastIndex] = aiMessage
        }
        return newMessages
      })
      
      // 更新对话历史
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: questionText },
        { role: 'ai', content: aiMessage.content }
      ])
    } catch (error) {
      console.error('发送消息失败:', error)
      message.error('发送消息失败，请稍后重试')
      
      const errorMessage: Message = {
        id: thinkingMessage.id, // 使用相同的ID替换thinking消息
        content: '抱歉，服务暂时不可用，请稍后重试。',
        isUser: false,
        timestamp: new Date()
      }
      
      // 替换最后一条thinking消息为错误消息
      setMessages(prev => {
        const newMessages = [...prev]
        const lastIndex = newMessages.length - 1
        if (newMessages[lastIndex]?.content === 'thinking') {
          newMessages[lastIndex] = errorMessage
        }
        return newMessages
      })
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([{
      id: 'welcome',
      content: '欢迎使用【高考AI聊天助手】！请输入您的问题，我将为您提供帮助。',
      isUser: false,
      timestamp: new Date()
    }])
    setConversationHistory([]) // 清空对话历史
  }

  const generateSolution = () => {
    // 验证必填字段
    if (!province) {
      message.warning('请选择您的省份')
      return
    }
    if (!subject) {
      message.warning('请选择文理科类')
      return
    }
    if (!score || score < 0 || score > 750) {
      message.warning('请输入有效的高考分数（0-750分）')
      return
    }

    // 保存用户信息到localStorage
    const userInfo = {
      province,
      subject,
      score,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('gaokao_user_info', JSON.stringify(userInfo))
    
    // 跳转到方案页面
    navigate('/solution')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: '20px 0'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '720px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 聊天头部 */}
        <div style={{
          textAlign: 'center',
          padding: '20px 16px 10px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <h1 style={{
            margin: '10px 0 4px',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            高考AI智能助手 🤖
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            让你的每一个问题，都有权威答案
          </p>
        </div>

        {/* 消息区域 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          scrollBehavior: 'smooth'
        }}>
          <List
            dataSource={messages}
            renderItem={(message: Message) => (
              <List.Item style={{ border: 'none', padding: '8px 0' }}>
                <div style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'flex-start',
                  flexDirection: message.isUser ? 'row-reverse' : 'row',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <Avatar 
                    icon={message.isUser ? <UserOutlined /> : <RobotOutlined />}
                    style={{ 
                      backgroundColor: message.isUser ? 'var(--primary-color)' : '#52c41a',
                      margin: message.isUser ? '0 0 0 10px' : '0 10px 0 0',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                  <div style={{
                    background: message.isUser ? 'var(--primary-color)' : '#fff',
                    color: message.isUser ? 'white' : 'var(--text-primary)',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderBottomLeftRadius: message.isUser ? '16px' : '4px',
                    borderBottomRightRadius: message.isUser ? '4px' : '16px',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    boxShadow: 'var(--shadow-light)',
                    lineHeight: 1.6
                  }}>
                    {message.content === 'thinking' ? (
                      <div className="thinking-animation">
                        <div className="thinking-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <Text style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                          AI正在思考中...
                        </Text>
                      </div>
                    ) : (
                      <>
                        {message.isUser ? (
                          <Text style={{ color: 'white' }}>
                            {message.content}
                          </Text>
                        ) : (
                          <div className="ai-message-content" style={{
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            lineHeight: '1.8'
                          }}>
                            <ReactMarkdown
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                p: ({node, ...props}) => <p style={{ margin: '0.5em 0' }} {...props} />,
                                h1: ({node, ...props}) => <h1 style={{ fontSize: '1.5em', margin: '0.8em 0 0.5em', fontWeight: 600 }} {...props} />,
                                h2: ({node, ...props}) => <h2 style={{ fontSize: '1.3em', margin: '0.7em 0 0.4em', fontWeight: 600 }} {...props} />,
                                h3: ({node, ...props}) => <h3 style={{ fontSize: '1.1em', margin: '0.6em 0 0.3em', fontWeight: 600 }} {...props} />,
                                ul: ({node, ...props}) => <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em' }} {...props} />,
                                ol: ({node, ...props}) => <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em' }} {...props} />,
                                li: ({node, ...props}) => <li style={{ margin: '0.3em 0' }} {...props} />,
                                code: ({node, inline, ...props}: any) => 
                                  inline ? (
                                    <code style={{ 
                                      background: 'rgba(0,0,0,0.05)', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px',
                                      fontSize: '0.9em',
                                      fontFamily: 'Consolas, Monaco, monospace'
                                    }} {...props} />
                                  ) : (
                                    <code style={{ 
                                      display: 'block',
                                      padding: '12px',
                                      borderRadius: '8px',
                                      fontSize: '0.9em',
                                      fontFamily: 'Consolas, Monaco, monospace',
                                      overflowX: 'auto'
                                    }} {...props} />
                                  ),
                                pre: ({node, ...props}) => (
                                  <pre style={{ 
                                    background: '#f6f8fa',
                                    margin: '0.8em 0',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                  }} {...props} />
                                ),
                                blockquote: ({node, ...props}) => (
                                  <blockquote style={{
                                    borderLeft: '4px solid var(--primary-color)',
                                    margin: '0.8em 0',
                                    paddingLeft: '1em',
                                    color: 'var(--text-secondary)',
                                    fontStyle: 'italic'
                                  }} {...props} />
                                ),
                                strong: ({node, ...props}) => <strong style={{ fontWeight: 600 }} {...props} />,
                                em: ({node, ...props}) => <em style={{ fontStyle: 'italic' }} {...props} />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <div style={{ 
                          fontSize: '12px', 
                          opacity: 0.7, 
                          marginTop: '4px',
                          color: message.isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-light)'
                        }}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>
        
        {/* 输入区域 */}
        <div style={{ 
          padding: '20px',
          borderTop: '1px solid var(--border-light)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* 配置选项 */}
          <div className="chat-config-section" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
            alignItems: 'center',
            padding: '16px',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)', 
                fontWeight: 500,
                minWidth: '40px'
              }}>
                地区:
              </span>
              <Select
                value={province}
                onChange={setProvince}
                style={{ minWidth: '120px' }}
                size="middle"
                bordered={false}
              >
                {provinces.map(p => (
                  <Option key={p} value={p}>{p}</Option>
                ))}
              </Select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)', 
                fontWeight: 500,
                minWidth: '40px'
              }}>
                科类:
              </span>
              <Radio.Group 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                size="small"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.06)'
                }}
              >
                <Radio value="理科" style={{ fontSize: '14px' }}>理科</Radio>
                <Radio value="文科" style={{ fontSize: '14px' }}>文科</Radio>
              </Radio.Group>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)', 
                fontWeight: 500,
                minWidth: '40px'
              }}>
                分数:
              </span>
              <Input
                type="number"
                placeholder="输入分数"
                value={score}
                onChange={(e) => setScore(e.target.value ? Number(e.target.value) : undefined)}
                style={{ 
                  width: '120px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.06)'
                }}
                min={0}
                max={750}
              />
            </div>
          </div>

          {/* 消息输入和按钮 */}
          <form onSubmit={sendMessage} className="chat-input-area" style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '16px',
            borderRadius: '20px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <TextArea
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入您的问题... (按 Enter 发送，Shift+Enter 换行)"
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ 
                flex: 1,
                borderRadius: '12px',
                resize: 'none',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '15px',
                lineHeight: '1.4',
                padding: '10px 16px',
                minHeight: '44px',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)'
                e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 122, 255, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)'
                e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.06)'
              }}
            />
            <Space size={12}>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
                size="large"
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
                  fontWeight: 500,
                  height: '44px',
                  minWidth: '80px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 122, 255, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3)'
                }}
              >
                发送
              </Button>
              <Button 
                icon={<ClearOutlined />}
                onClick={clearMessages}
                size="large"
                style={{
                  borderRadius: '12px',
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.2)',
                  color: '#ff3b30',
                  fontWeight: 500,
                  height: '44px',
                  minWidth: '80px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ff3b30'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 59, 48, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'
                  e.currentTarget.style.color = '#ff3b30'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                清空
              </Button>
              <Button 
                icon={<FileTextOutlined />}
                onClick={generateSolution}
                size="large"
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 500,
                  height: '44px',
                  minWidth: '100px',
                  boxShadow: '0 4px 16px rgba(82, 196, 26, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(82, 196, 26, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(82, 196, 26, 0.3)'
                }}
              >
                生成方案
              </Button>
            </Space>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes thinking {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        
        .thinking-animation {
          display: flex;
          align-items: center;
          padding: 8px 0;
        }
        
        .thinking-dots {
          display: flex;
          gap: 4px;
        }
        
        .thinking-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-color);
          animation: thinking 1.4s infinite ease-in-out;
        }
        
        .thinking-dots span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .thinking-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .thinking-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        .chat-input-container .ant-input:focus {
          border-color: transparent !important;
          box-shadow: none !important;
        }
        
        .chat-config-section {
          background: rgba(102, 126, 234, 0.05);
          border: 1px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }
        
        .chat-config-section:hover {
          background: rgba(102, 126, 234, 0.08);
          border-color: rgba(102, 126, 234, 0.15);
        }
        
        @media (max-width: 768px) {
          .chat-container {
            height: calc(100vh - 70px) !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 8px !important;
            align-items: stretch !important;
          }
          
          .glass-card {
            height: 100% !important;
            border-radius: 12px !important;
            margin: 0 !important;
            max-height: calc(100vh - 86px) !important;
          }
          
          .chat-config-section {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: flex-start !important;
            padding: 12px !important;
            margin-bottom: 16px !important;
          }
          
          .chat-config-section > div {
            width: 100% !important;
            justify-content: space-between !important;
          }
          
          .chat-input-area {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          
          .chat-input-area .ant-space {
            width: 100% !important;
            justify-content: center !important;
          }
          
          .chat-input-area .ant-btn {
            flex: 1 !important;
            max-width: 120px !important;
          }
        }
        
        @media (max-width: 480px) {
          .chat-input-area {
            padding: 12px !important;
          }
          
          .chat-config-section {
            padding: 12px !important;
            margin-bottom: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Chat