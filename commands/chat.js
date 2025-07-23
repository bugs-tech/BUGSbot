import axios from 'axios';
import settings from '../settings.js';

export const name = 'chat';
export const description = 'Chat with AI using OpenAI API key';
export const category = 'AI';

export async function execute(sock, msg, args, context) {
  const { senderJid } = context;

  if (!args.length) {
    await sock.sendMessage(senderJid, {
      text: '🤖 *Usage:* .chat <your message>\n\nExample: .chat How are you today?'
    });
    return;
  }

  const prompt = args.join(' ');
  const apiKey = settings.ai.apiKey;
  const endpoint = settings.ai.endpoint;

  if (!apiKey) {
    await sock.sendMessage(senderJid, {
      text: '⚠️ API key is missing. Please update your settings.'
    });
    return;
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const reply = response.data.choices[0].message.content.trim();

    await sock.sendMessage(senderJid, {
      text: `💬 *AI says:*\n${reply}`
    });
  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    await sock.sendMessage(senderJid, {
      text: `⚠️ Chatbot failed: ${error.message || 'Unknown error'}`
    });
  }
}
