// commands/define.js

import axios from 'axios';

export const name = 'define';
export const description = 'Get the definition of a word or concept';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
    const { senderJid } = context;

    if (!args.length) {
        await sock.sendMessage(senderJid, {
            text: `📚 *Usage:* .define <word or concept>\n\nExample: .define photosynthesis`
        });
        return;
    }

    const query = args.join(' ');

    try {
        const res = await axios.post('https://gpt4-free-api.shn.hk/v1/chat/completions', {
            messages: [
                {
                    role: 'user',
                    content: `Define: ${query} in simple terms.`
                }
            ],
            model: 'gpt-4'
        });

        const definition = res.data.choices[0].message.content;

        await sock.sendMessage(senderJid, {
            text: `📖 *Definition of "${query}":*\n\n${definition}`
        });

    } catch (err) {
        console.error('❌ Definition lookup failed:', err.message);
        await sock.sendMessage(senderJid, {
            text: `⚠️ Could not get definition.\nReason: ${err.message || 'Unknown error'}`
        });
    }
}
