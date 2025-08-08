import fetch from 'node-fetch';

export const name = 'ytdl';
export const description = 'Download audio/video from YouTube';
export const category = 'Downloader';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .ytdl [YouTube URL]\n_Example: .ytdl https://youtu.be/60ItHLz5WEA_');
  }

  const ytUrl = encodeURIComponent(args[0]);
  const apiUrl = `https://api.giftedtech.co.ke/api/download/ytdl?apikey=gifted&url=${ytUrl}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json?.status || !json?.result?.url) {
      return sendReply('❌ Failed to download. Make sure the YouTube URL is valid.\n\n— *BUGS-BOT support tech*');
    }

    const { title, quality, size, url, type } = json.result;

    const messageOptions = {
      caption: `🎬 *${title}*\n📥 Type: ${type}\n📦 Quality: ${quality}\n🧮 Size: ${size}\n\n— *BUGS-BOT support tech*`,
      fileName: `${title.replace(/\s+/g, '_')}.${type === 'audio' ? 'mp3' : 'mp4'}`
    };

    if (type === 'audio') {
      await sock.sendMessage(msg.chat, {
        audio: { url },
        mimetype: 'audio/mpeg',
        ...messageOptions
      }, { quoted: msg });
    } else {
      await sock.sendMessage(msg.chat, {
        video: { url },
        mimetype: 'video/mp4',
        ...messageOptions
      }, { quoted: msg });
    }

    console.log(`📥 .ytdl success: ${title} (${type})`);

  } catch (error) {
    console.error('❌ Error in .ytdl:', error);
    return sendReply('❌ An unexpected error occurred while downloading.\n\n— *BUGS-BOT support tech*');
  }
}
