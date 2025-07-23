// commands/ask.js

import axios from 'axios';
import settings from '../settings.js';

export const name = 'ask';
export const description = 'Ask AI a question using GPT-4 (OpenAI Key)';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
    const { senderJid } = context;
    const prompt = args.join(' ');

    if (!prompt) {
        await sock.sendMessage(senderJid, {
            text: '❓ *Usage:* `.ask <your question>`\n\nExample: `.ask What is quantum computing?`'
        });
        return;
    }

    const apiKey = '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';
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await axios.post(
            endpoint,
            {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        const reply = response.data?.choices?.[0]?.message?.content?.trim();
        if (reply) {
            await sock.sendMessage(senderJid, { text: `🤖 *AI Response:*\n\n${reply}` });
        } else {
            throw new Error('No content returned from AI');
        }
    } catch (err) {
        console.error('❌ AI request failed:', err.message);
        await sock.sendMessage(senderJid, {
            text: `⚠️ Failed to get AI response.\nReason: ${err.message || 'Unknown error'}`
        });
    }
}