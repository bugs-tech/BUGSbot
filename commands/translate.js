// commands/translate.js

import axios from 'axios';

export const name = 'translate';
export const description = 'Translate text to a specified language using OpenAI';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
    const { senderJid } = context;

    if (args.length < 2) {
        await sock.sendMessage(senderJid, {
            text: `🌍 *Usage:* .translate <language> <text>\n\nExample: .translate french Hello, how are you?`
        });
        return;
    }

    const targetLang = args[0];
    const textToTranslate = args.slice(1).join(' ');

    const apiKey = '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';
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await axios.post(
            endpoint,
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'user',
                        content: `Translate the following into ${targetLang}:\n\n${textToTranslate}`
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        const translated = response.data.choices[0].message.content;

        await sock.sendMessage(senderJid, {
            text: `🌐 *Translated to ${targetLang}:*\n\n${translated}`
        });
    } catch (err) {
        console.error('❌ Translation failed:', err.message);
        await sock.sendMessage(senderJid, {
            text: `⚠️ Failed to translate.\nReason: ${err.message || 'Unknown error'}`
        });
    }
}