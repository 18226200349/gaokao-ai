document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');
  const clearBtn = document.getElementById('clear-button');

  // 自动滚动到底部
  const scrollToBottom = () => {
    const container = document.getElementById('chat-container');
    container.scrollTop = container.scrollHeight;
  };

  // 添加消息
  function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = role === 'user' ? '🧑‍🎓' : '🤖';

    const content = document.createElement('div');
    content.classList.add('content');
    content.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    scrollToBottom();
  }

  // 模拟AI回复（示例逻辑，可替换为你的接口）
  async function mockAIResponse(userInput) {
    addMessage('ai', '正在思考中...');
    await new Promise((r) => setTimeout(r, 800));
    const aiMessage = `你问的是「${userInput}」吗？根据最新高考政策，我可以帮你分析一下～`;
    messages.lastChild.querySelector('.content').textContent = aiMessage;
    scrollToBottom();
  }

  // 发送消息
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    addMessage('user', userInput);
    input.value = '';
    await mockAIResponse(userInput);
  });

  // 清空聊天记录
  clearBtn.addEventListener('click', function () {
    messages.innerHTML = `
      <div class="message system">
        <div class="avatar">💬</div>
        <div class="content">欢迎使用【高考AI聊天助手】！请输入您的问题，我将为您提供帮助。</div>
      </div>`;
  });
});
