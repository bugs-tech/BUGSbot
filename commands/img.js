import fetch from 'node-fetch';

const handler = async (m, { args, text, sendImage, sendReply }) => {
  try {
    const query = text || 'random';
    const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
    
    await sendImage(m.chat, url, `🔍 Here's an image for: *${query}*`, m);
  } catch (err) {
    console.error('❌ Image fetch error:', err);
    await sendReply(m.chat, '⚠️ Failed to fetch image. Try again later.', m);
  }
};

handler.help = ['img <query>'];
handler.tags = ['tools'];
handler.command = /^img$/i;
handler.limit = false;

export default handler;
