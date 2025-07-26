import axios from 'axios';
import settings from '../settings.js';

export const name = 'img';
export const description = 'Generate an image from text using AI';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
    const chatId = msg.key.remoteJid;
    const prompt = args.join(' ');

    if (!prompt) {
        return await sock.sendMessage(chatId, {
            text: '🖼️ *Usage:* `.img <description>`\n\nExample: `.img A robot sitting on a beach at sunset`'
        });
    }

    try {
        const openaiKey = settings.openaiApiKey;
        if (!openaiKey) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ OpenAI API key not configured in settings.'
            });
        }

        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            }
        });

        const imageUrl = response.data?.data?.[0]?.url;
        if (imageUrl) {
            await sock.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: `🧠 *AI Image Generated:*\n_${prompt}_`
            });
        } else {
            throw new Error('No image returned');
        }
    } catch (err) {
        console.error('❌ Image generation failed:', err.message);
        await sock.sendMessage(chatId, {
            text: `⚠️ Failed to generate image.\nReason: ${err.message || 'Unknown error'}`
        });
    }
}
