import fetch from 'node-fetch';

const handler = async (m, { text, sendImage, sendReply }) => {
  try {
    const width = 800;
    const height = 600;
    const url = `https://picsum.photos/${width}/${height}`;
    await sendImage(m.chat, url, `🖼️ Here's a random placeholder image`, m);
  } catch (err) {
    console.error('IMG2 Error:', err);
    await sendReply(m.chat, '⚠️ Failed to fetch image from Picsum.', m);
  }
};

handler.help = ['img2'];
handler.tags = ['tools'];
handler.command = /^img2$/i;

export default handler;
