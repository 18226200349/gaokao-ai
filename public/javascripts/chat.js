document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');
  const clearBtn = document.getElementById('clear-button');

  // 自动滚动到底部
  const scrollToBottom = () => {
    const container = document.querySelector('.chat-container');
    container.scrollTop = container.scrollHeight;
  };

  // 添加消息
  function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = role === 'user' ? '🧑‍🎓' : '🤖';

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messages.appendChild(messageDiv);
    scrollToBottom();
  }

  // 调用API获取AI回复
  async function getAIResponse(userInput) {
    try {
      // 添加"正在思考中..."的消息
      addMessage('ai', '正在思考中...');
      
      // 设置请求参数
      const requestData = {
        question: userInput,
        province: '北京', // 默认使用北京，可根据需要修改或从用户输入获取
        userInfo: {
          province: '北京',
          schoolProvince: '北京'
        },
        interests: ['理工'] // 默认兴趣，可根据需要修改
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
      if (data.code === 200 && data.data && data.data.reply) {
        messages.lastChild.querySelector('.bubble').textContent = data.data.reply;
      } else {
        messages.lastChild.querySelector('.bubble').textContent = `抱歉，我无法回答这个问题。错误信息：${data.message || '未知错误'}`;
      }
    } catch (error) {
      console.error('API请求错误:', error);
      // 如果最后一条消息是"正在思考中..."，则更新为错误信息
      if (messages.lastChild && messages.lastChild.classList.contains('ai')) {
        messages.lastChild.querySelector('.bubble').textContent = `抱歉，请求发生错误：${error.message}`;
      } else {
        addMessage('ai', `抱歉，请求发生错误：${error.message}`);
      }
    } finally {
      scrollToBottom();
    }
  }

  // 发送消息
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    addMessage('user', userInput);
    input.value = '';
    await getAIResponse(userInput);
  });

  // 清空聊天记录
  clearBtn.addEventListener('click', function () {
    messages.innerHTML = `
      <div class="message system">
        <div class="avatar">💬</div>
        <div class="bubble">欢迎使用【高考AI聊天助手】！请输入您的问题，我将为您提供帮助。</div>
      </div>`;
    scrollToBottom();
  });
});
