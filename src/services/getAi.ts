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

// 流式聊天函数
async function streamChatWithDoubao(userMessage: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
        console.log('发起流式请求到豆包API');
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
            ],
            stream: true
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            responseType: 'stream'
        });

        console.log('流式请求已发送，等待响应...');
        let buffer = '';

        response.data.on('data', (chunk: Buffer) => {
            const chunkStr = chunk.toString();
            console.log('收到原始数据块:', JSON.stringify(chunkStr));
            
            // 将数据添加到缓冲区
            buffer += chunkStr;
            
            // 按行处理
            const lines = buffer.split('\n');
            // 保留最后一行（可能不完整）
            buffer = lines.pop() || '';
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                console.log('处理行:', JSON.stringify(trimmedLine));
                
                if (trimmedLine.startsWith('data: ')) {
                    const data = trimmedLine.slice(6).trim();
                    console.log('提取数据:', JSON.stringify(data));
                    
                    if (data === '[DONE]') {
                        console.log('流式输出完成');
                        return;
                    }
                    
                    if (data === '') {
                        console.log('空数据，跳过');
                        continue;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        console.log('解析成功:', parsed);
                        
                        // 尝试不同的内容提取路径
                        let content = null;
                        if (parsed.choices?.[0]?.delta?.content) {
                            content = parsed.choices[0].delta.content;
                        } else if (parsed.choices?.[0]?.message?.content) {
                            content = parsed.choices[0].message.content;
                        } else if (parsed.content) {
                            content = parsed.content;
                        } else if (parsed.text) {
                            content = parsed.text;
                        }
                        
                        if (content) {
                            console.log('提取到内容:', JSON.stringify(content));
                            onChunk(content);
                        } else {
                            console.log('未找到内容字段，完整数据:', parsed);
                        }
                    } catch (e: any) {
                        console.log('JSON解析失败:', e.message, '原始数据:', JSON.stringify(data));
                    }
                } else if (trimmedLine !== '') {
                    console.log('非data行:', JSON.stringify(trimmedLine));
                }
            }
        });

        response.data.on('end', () => {
            console.log('流式响应结束');
        });

        response.data.on('error', (error: any) => {
            console.error('流式响应错误:', error);
        });

        return new Promise((resolve, reject) => {
            response.data.on('end', resolve);
            response.data.on('error', reject);
        });
    } catch (error: any) {
        console.error('流式调用失败:', error.response?.data || error.message);
        throw error;
    }
}

// 保留兼容性导出
export default {
    chat: chatWithDoubao,
    streamChat: streamChatWithDoubao
};
