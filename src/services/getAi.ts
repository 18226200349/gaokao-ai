const axios = require('axios');

const API_KEY = 'bd747896-e89b-46f4-a5ab-0a232d086845';
const ENDPOINT_ID = 'ep-20251015101857-wc8xz';
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

interface Message {
  role: string;
  content: string;
}

async function chatWithDoubao(userMessage: string): Promise<string> {
    try {
        const response = await axios.post(API_URL, {
            model: ENDPOINT_ID,
            messages: [
                {
                    role: 'system',
                    content: '你是一个有帮助的高考AI助手'
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        const message = response.data.choices[0].message.content;
        const reasoning = response.data.choices[0].message.reasoning_content;

        console.log('AI回复:', message);
        console.log('推理过程:', reasoning);
        console.log('Token使用:', response.data.usage);

        return message;
    } catch (error: any) {
        console.error('调用失败:', error.response?.data || error.message);
        throw error;
    }
}

// 保留兼容性导出
export default {
    chat: chatWithDoubao
};
