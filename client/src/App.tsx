import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import Layout from './components/Layout'
import Home from './pages/Home'
import Chat from './pages/Chat'
import GaokaoQuery from './pages/GaokaoQuery'
import './App.css'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/gaokao" element={<GaokaoQuery />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  )
}

export default App
