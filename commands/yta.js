import fetch from 'node-fetch';

export const name = 'yta';
export const description = 'Download YouTube video as MP4';
export const category = 'Media';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;

  if (!args.length) {
    return sendReply('📌 Usage: .yta [YouTube URL]\n_Example: .yta https://youtu.be/60ItHLz5WEA_');
  }

  const url = args[0];
  const apiUrl = `https://api.giftedtech.co.ke/api/download/yta?apikey=gifted&url=${encodeURIComponent(url)}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json?.status || !json?.result?.url) {
      return sendReply('❌ Failed to download video. Please try again.\n\n— *BUGS-BOT support tech*');
    }

    const video = json.result;

    await sock.sendMessage(msg.chat, {
      video: { url: video.url },
      mimetype: 'video/mp4',
      caption: `🎬 *${video.title}*\n📥 Downloaded successfully as MP4.\n\n— *BUGS-BOT support tech*`
    }, { quoted: msg });

    console.log(`📥 .yta success: ${video.title} (${url})`);

  } catch (error) {
    console.error('❌ Error in .yta:', error);
    return sendReply('❌ An unexpected error occurred while downloading the video.\n\n— *BUGS-BOT support tech*');
  }
}
