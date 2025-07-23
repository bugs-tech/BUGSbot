// commands/img.js

import axios from 'axios';
import settings from '../settings.js';

export const name = 'img';
export const description = 'Generate an image from text using AI';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
    const { senderJid } = context;
    const prompt = args.join(' ');

    if (!prompt) {
        await sock.sendMessage(senderJid, {
            text: '🖼️ *Usage:* `.img <description>`\n\nExample: `.img A robot sitting on a beach at sunset`'
        });
        return;
    }

    try {
        const response = await axios.post('https://gpt4-free-api.shn.hk/v1/images/generations', {
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024'
        });

        const imageUrl = response.data?.data?.[0]?.url;
        if (imageUrl) {
            await sock.sendMessage(senderJid, {
                image: { url: imageUrl },
                caption: `🧠 *AI Image Generated:*\n_${prompt}_`
            });
        } else {
            throw new Error('No image returned');
        }
    } catch (err) {
        console.error('❌ Image generation failed:', err.message);
        await sock.sendMessage(senderJid, {
            text: `⚠️ Failed to generate image.\nReason: ${err.message || 'Unknown error'}`
        });
    }
}
