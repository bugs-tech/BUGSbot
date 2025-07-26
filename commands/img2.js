import fetch from 'node-fetch';

const handler = async (m, { text, sendImage, sendReply }) => {
  try {
    const query = text || 'nature';
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`);
    const html = await res.text();
    const match = html.match(/vqd='(.*?)'/);
    if (!match) return await sendReply(m.chat, '❌ Failed to get image ID.', m);

    const vqd = match[1];
    const apiUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}`;
    const imgRes = await fetch(apiUrl);
    const json = await imgRes.json();

    if (!json.results || json.results.length === 0) throw 'No results';
    const img = json.results[Math.floor(Math.random() * json.results.length)];
    
    await sendImage(m.chat, img.image, `🔍 DuckDuckGo Image for *${query}*`, m);
  } catch (err) {
    console.error('IMG3 Error:', err);
    await sendReply(m.chat, '⚠️ Failed to fetch image from DuckDuckGo.', m);
  }
};

handler.help = ['img3 <query>'];
handler.tags = ['tools'];
handler.command = /^img3$/i;

export default handler;
