// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  initializeSolutionPage();
  loadSolutionData();
  setupEventListeners();
});

// 初始化页面
function initializeSolutionPage() {
  console.log('方案展示页面初始化...');
}

// 加载方案数据
function loadSolutionData() {
  // 从localStorage获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  // 显示基本信息
  displayUserInfo(userInfo);
  
  // 生成推荐方案
  generateRecommendations(userInfo);
  
  // 生成专业推荐
  generateMajors(userInfo);
}

// 显示用户信息
function displayUserInfo(userInfo) {
  document.getElementById('province-value').textContent = userInfo.province || '-';
  document.getElementById('subject-value').textContent = userInfo.subject || '-';
  document.getElementById('score-value').textContent = userInfo.score ? `${userInfo.score}分` : '-';
  
  // 根据分数估算位次（示例逻辑）
  if (userInfo.score) {
    const estimatedRank = estimateRank(userInfo.score, userInfo.subject);
    document.getElementById('rank-value').textContent = estimatedRank;
  } else {
    document.getElementById('rank-value').textContent = '-';
  }
}

// 估算位次（示例算法）
function estimateRank(score, subject) {
  // 这是一个简化的估算逻辑，实际应该根据真实数据
  const baseRank = subject === '理科' ? 50000 : 60000;
  const rankDiff = (650 - score) * 1000;
  const estimatedRank = Math.max(1000, baseRank + rankDiff);
  
  return formatNumber(Math.round(estimatedRank));
}

// 格式化数字
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 生成推荐方案
function generateRecommendations(userInfo) {
  const score = userInfo.score || 600;
  const subject = userInfo.subject || '理科';
  
  // 生成三种方案的院校
  const stableUniversities = generateUniversityList(score, -10, -30, 'stable');
  const moderateUniversities = generateUniversityList(score, -5, 5, 'moderate');
  const reachUniversities = generateUniversityList(score, 5, 20, 'reach');
  
  // 渲染到对应的标签页
  renderUniversities('stable-content', stableUniversities);
  renderUniversities('moderate-content', moderateUniversities);
  renderUniversities('reach-content', reachUniversities);
}

// 生成院校列表
function generateUniversityList(baseScore, minDiff, maxDiff, type) {
  const universities = [
    { name: '清华大学', location: '北京', type: '985/211', specialty: '工科' },
    { name: '北京大学', location: '北京', type: '985/211', specialty: '综合' },
    { name: '浙江大学', location: '浙江', type: '985/211', specialty: '综合' },
    { name: '上海交通大学', location: '上海', type: '985/211', specialty: '工科' },
    { name: '复旦大学', location: '上海', type: '985/211', specialty: '综合' },
    { name: '中国科学技术大学', location: '安徽', type: '985/211', specialty: '理科' },
    { name: '南京大学', location: '江苏', type: '985/211', specialty: '综合' },
    { name: '中山大学', location: '广东', type: '985/211', specialty: '综合' },
    { name: '武汉大学', location: '湖北', type: '985/211', specialty: '综合' },
    { name: '华中科技大学', location: '湖北', type: '985/211', specialty: '工科' }
  ];
  
  return universities.slice(0, 5).map((uni, index) => {
    const scoreDiff = Math.floor(Math.random() * (maxDiff - minDiff) + minDiff);
    return {
      ...uni,
      rank: index + 1,
      score: baseScore + scoreDiff,
      type: type
    };
  });
}

// 渲染院校列表
function renderUniversities(containerId, universities) {
  const container = document.querySelector(`#${containerId} .universities-list`);
  
  container.innerHTML = universities.map(uni => `
    <div class="university-card ${uni.type}">
      <div class="university-rank">${uni.rank}</div>
      <div class="university-info">
        <div class="university-name">${uni.name}</div>
        <div class="university-details">
          <span>📍 ${uni.location}</span>
          <span>🏆 ${uni.type}</span>
          <span>📚 ${uni.specialty}</span>
        </div>
      </div>
      <div class="university-score">${uni.score}分</div>
    </div>
  `).join('');
}

// 生成专业推荐
function generateMajors(userInfo) {
  const majors = [
    {
      name: '计算机科学与技术',
      category: '工学',
      description: '培养具有良好的科学素养,系统掌握计算机科学与技术的基本理论、基本知识和基本技能的高级专门人才。'
    },
    {
      name: '人工智能',
      category: '工学',
      description: '培养掌握人工智能理论与技术,能够进行人工智能算法分析与设计的高级专门人才。'
    },
    {
      name: '软件工程',
      category: '工学',
      description: '培养掌握软件工程学科的基本理论和技术,能够从事软件系统开发、测试、维护的高级工程技术人才。'
    },
    {
      name: '数据科学与大数据技术',
      category: '工学',
      description: '培养具有大数据思维能力,掌握大数据技术和数据分析方法的复合型人才。'
    },
    {
      name: '电子信息工程',
      category: '工学',
      description: '培养具备现代电子技术理论、通晓电子系统设计原理与设计方法的高级工程技术人才。'
    },
    {
      name: '自动化',
      category: '工学',
      description: '培养掌握自动控制理论和技术,能够从事自动化系统分析、设计、开发的高级工程技术人才。'
    }
  ];
  
  const majorsContainer = document.querySelector('.majors-grid');
  
  majorsContainer.innerHTML = majors.map(major => `
    <div class="major-card">
      <div class="major-name">${major.name}</div>
      <div class="major-category">${major.category}</div>
      <div class="major-description">${major.description}</div>
    </div>
  `).join('');
}

// 设置事件监听器
function setupEventListeners() {
  // 标签页切换
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
  
  // 导出方案
  document.getElementById('export-btn').addEventListener('click', exportSolution);
  
  // 打印方案
  document.getElementById('print-btn').addEventListener('click', printSolution);
  
  // 保存方案
  document.getElementById('save-btn').addEventListener('click', saveSolution);
  
  // 一键办理
  document.getElementById('apply-btn').addEventListener('click', applySolution);
}

// 切换标签页
function switchTab(tabName) {
  // 移除所有活动状态
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // 添加新的活动状态
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-content`).classList.add('active');
}

// 导出方案
function exportSolution() {
  // 获取方案数据
  const solutionData = {
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    timestamp: new Date().toISOString()
  };
  
  // 创建Blob并下载
  const blob = new Blob([JSON.stringify(solutionData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `志愿填报方案_${new Date().getTime()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('方案已导出成功！', 'success');
}

// 打印方案
function printSolution() {
  window.print();
}

// 保存方案
function saveSolution() {
  const solutionData = {
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    savedAt: new Date().toISOString()
  };
  
  // 保存到localStorage
  localStorage.setItem('savedSolution', JSON.stringify(solutionData));
  
  showNotification('方案已保存到本地！', 'success');
}

// 一键办理
function applySolution() {
  showNotification('正在跳转到志愿填报系统...', 'info');
  
  // 这里应该跳转到实际的志愿填报系统
  setTimeout(() => {
    // window.location.href = '/apply';
    showNotification('功能开发中,敬请期待！', 'warning');
  }, 1500);
}

// 显示通知
function showNotification(message, type = 'info') {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // 添加到页面
  document.body.appendChild(notification);
  
  // 3秒后移除
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// 院校卡片点击事件（显示详情）
document.addEventListener('click', function(e) {
  if (e.target.closest('.university-card')) {
    const card = e.target.closest('.university-card');
    const universityName = card.querySelector('.university-name').textContent;
    showUniversityDetail(universityName);
  }
  
  if (e.target.closest('.major-card')) {
    const card = e.target.closest('.major-card');
    const majorName = card.querySelector('.major-name').textContent;
    showMajorDetail(majorName);
  }
});

// 显示院校详情
function showUniversityDetail(name) {
  showNotification(`正在加载 ${name} 的详细信息...`, 'info');
  // 这里可以实现弹窗显示详细信息
}

// 显示专业详情
function showMajorDetail(name) {
  showNotification(`正在加载 ${name} 的详细信息...`, 'info');
  // 这里可以实现弹窗显示详细信息
}