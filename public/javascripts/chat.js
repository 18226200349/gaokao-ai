document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');
  const clearBtn = document.getElementById('clear-button');
  
  // 存储对话历史
  let conversationHistory = [];

  // 自动滚动到底部
  const scrollToBottom = () => {
    const container = document.querySelector('.chat-container');
    container.scrollTop = container.scrollHeight;
  };

  // 格式化文本为HTML
  function formatTextToHTML(text) {
    // 转义HTML特殊字符（除了我们要处理的格式标记）
    const escapeHtml = (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    // 处理代码块
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // 处理行内代码
    text = text.replace(/`([^`]+)`/g, (match, code) => {
      return `<code class="inline-code">${escapeHtml(code)}</code>`;
    });

    // 处理标题（### 三级标题）
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // 处理标题（## 二级标题）
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    
    // 处理标题（# 一级标题）
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // 处理粗体 **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // 处理斜体 *text*
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // 处理无序列表
    text = text.replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // 处理有序列表
    text = text.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
    const orderedListRegex = /(<li>.*?<\/li>\n?)+/g;
    text = text.replace(orderedListRegex, (match) => {
      if (!match.includes('<ul>')) {
        return `<ol>${match}</ol>`;
      }
      return match;
    });

    // 处理链接 [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // 处理换行（两个或以上换行符变为段落分隔）
    const paragraphs = text.split(/\n\s*\n/);
    text = paragraphs.map(p => {
      // 跳过已经是HTML标签的段落
      if (p.trim().startsWith('<')) {
        return p;
      }
      // 处理单个换行
      const lines = p.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        return `<p>${lines.join('<br>')}</p>`;
      }
      return '';
    }).join('');

    return text;
  }

  // 添加消息
  function addMessage(role, text, isHTML = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = role === 'user' ? '🧑‍🎓' : '🤖';

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    if (isHTML) {
      bubble.innerHTML = text;
    } else if (role === 'ai') {
      // AI回复使用格式化
      bubble.innerHTML = formatTextToHTML(text);
    } else {
      // 用户消息保持纯文本
      bubble.textContent = text;
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messages.appendChild(messageDiv);
    scrollToBottom();
  }

  // 获取AI回复，接收省市、文理科和分数作为参数
  async function getAIResponse(userInput, selectedProvince, selectedSubject, score) {
    // 显示"正在思考中..."消息
    addMessage('ai', '正在思考中...');
    
    try {
      // 根据选择的文理科设置兴趣标签
      const interests = selectedSubject === '理科' ? ['理工'] : ['文史'];
      
      // 构造问题文本，确保包含省市、文理科和分数
      let questionText = userInput;
      if (!questionText) {
        questionText = `我想了解${selectedProvince}${selectedSubject}${score}分的高考志愿报名`;
      }
      // 即使用户有输入，也在问题中补充省市、文理科和分数信息
      else {
        questionText = `${userInput}（${selectedProvince}${selectedSubject}${score}分）`;
      }
      
      // 设置请求参数，包含对话历史
      const requestData = {
        question: questionText,
        province: selectedProvince, // 使用用户选择的省份
        userInfo: {
          province: selectedProvince,
          schoolProvince: selectedProvince
        },
        interests: interests,
        subject: selectedSubject, // 添加文理科字段
        score: score, // 添加分数字段
        conversationHistory: conversationHistory // 添加对话历史
      };
      
      // 发送POST请求到后端API
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // 解析JSON响应
      const data = await response.json();
      
      // 更新AI回复内容
      if (data.code === 200 && data.data) {
        // 更新对话历史
        conversationHistory.push({ role: 'user', content: questionText });
        
        if (data.data.majors && Array.isArray(data.data.majors)) {
          // 如果返回的是专业选择列表
          const bubble = messages.lastChild.querySelector('.bubble');
          bubble.textContent = data.data.text || '您有什么意向专业么？我们为您推荐以下专业：';
          
          // 记录回复到对话历史
          conversationHistory.push({ role: 'ai', content: bubble.textContent, majors: data.data.majors });
          
          // 创建专业选择容器
          const majorsContainer = document.createElement('div');
          majorsContainer.classList.add('majors-container');
          
          // 添加专业选择按钮
          data.data.majors.forEach(major => {
            const majorButton = document.createElement('button');
            majorButton.classList.add('major-button');
            majorButton.textContent = major;
            
            // 添加点击事件，将专业名称填入输入框
            majorButton.addEventListener('click', function() {
              input.value = `我想了解${major}专业的高考志愿报名`;
              // 聚焦到输入框
              input.focus();
            });
            
            majorsContainer.appendChild(majorButton);
          });
          
          bubble.appendChild(majorsContainer);
        } else if (data.data.details) {
          // 专业选择后的详细信息回复
          const bubble = messages.lastChild.querySelector('.bubble');
          // 将文本内容按换行符分割并创建段落
          const textParts = (data.data.text + '\n\n' + data.data.details).split('\n');
          bubble.innerHTML = '';
          
          textParts.forEach((part, index) => {
            const p = document.createElement('p');
            p.textContent = part;
            // 为不同段落添加不同样式
            if (index === 0) {
              p.style.fontWeight = 'bold';
              p.style.marginBottom = '10px';
            } else {
              p.style.margin = '3px 0';
            }
            bubble.appendChild(p);
          });
          
          // 记录回复到对话历史
          conversationHistory.push({ role: 'ai', content: data.data.text + '\n' + data.data.details });
        } else if (data.data.reply) {
          // 普通文本回复 - 使用格式化显示
          messages.lastChild.querySelector('.bubble').innerHTML = formatTextToHTML(data.data.reply);
          // 记录回复到对话历史
          conversationHistory.push({ role: 'ai', content: data.data.reply });
        }
      } else {
        const errorMsg = `抱歉，我无法回答这个问题。错误信息：${data.message || '未知错误'}`;
        messages.lastChild.querySelector('.bubble').textContent = errorMsg;
        // 记录错误信息到对话历史
        conversationHistory.push({ role: 'ai', content: errorMsg });
      }
    } catch (error) {
      console.error('API请求错误:', error);
      const errorMsg = `抱歉，请求发生错误：${error.message}`;
      // 如果最后一条消息是"正在思考中..."，则更新为错误信息
      if (messages.lastChild && messages.lastChild.classList.contains('ai')) {
        messages.lastChild.querySelector('.bubble').textContent = errorMsg;
      } else {
        addMessage('ai', errorMsg);
      }
      // 记录错误信息到对话历史
      conversationHistory.push({ role: 'ai', content: errorMsg });
    } finally {
      scrollToBottom();
    }
  }

  // 发送消息
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const userInput = input.value.trim();

    // 获取用户选择的省份
    const provinceSelect = document.getElementById('province-select');
    const selectedProvince = provinceSelect.value;
    
    // 获取用户选择的文理科
    const subjectRadios = document.getElementsByName('subject');
    let selectedSubject = '理科'; // 默认选择理科
    for (const radio of subjectRadios) {
      if (radio.checked) {
        selectedSubject = radio.value;
        break;
      }
    }
    
    // 获取用户输入的分数，设为必填项
    const scoreInput = document.getElementById('score-input');
    const score = scoreInput.value ? parseInt(scoreInput.value, 10) : null;
    
    // 验证分数是否填写
    if (!score || score < 0 || score > 750) {
      alert('请输入考生分数');
      scoreInput.focus();
      return;
    }
    
    // 构造要显示的消息文本，确保包含省市、文理科和分数
    let displayText = userInput;
    if (!displayText) {
      displayText = `我想了解${selectedProvince}${selectedSubject}${score}分的高考志愿报名`;
    }
    
    addMessage('user', displayText);
    input.value = '';
    // 保留分数在输入框中
    await getAIResponse(userInput, selectedProvince, selectedSubject, score);
  });

  // 清空聊天记录
  clearBtn.addEventListener('click', function () {
    messages.innerHTML = `
      <div class="message system">
        <div class="avatar">💬</div>
        <div class="bubble">欢迎使用【高考AI聊天助手】！请输入您的问题，我将为您提供帮助。</div>
      </div>`;
    // 清空对话历史
    conversationHistory = [];
    scrollToBottom();
  });
});
