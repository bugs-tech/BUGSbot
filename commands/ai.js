// commands/ai.js

import fetch from 'node-fetch';
import settings from '../settings.js';

export const name = 'ai';

export async function execute(sock, msg, args, context) {
    const { senderJid } = context;
    const prompt = args.join(' ');

    if (!prompt) {
        await sock.sendMessage(senderJid, {
            text: '❗ *Usage:* .ai <your prompt>'
        });
        return;
    }

    const openaiKey = settings.openaiApiKey;
    if (!openaiKey) {
        await sock.sendMessage(senderJid, {
            text: '⚠️ OpenAI API key not configured in settings.'
        });
        return;
    }

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;

        await sock.sendMessage(senderJid, {
            text: reply || '⚠️ AI did not return a response.'
        });

    } catch (err) {
        console.error('❌ AI command error:', err);
        await sock.sendMessage(senderJid, {
            text: '❌ Failed to fetch AI response. Please try again later.'
        });
    }
}
