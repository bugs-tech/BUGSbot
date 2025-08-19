// commands/facedl1.js
import fetch from "node-fetch";
import { sendReply } from "../lib/sendReply.js"; // use named import

export const name = "facedl1";
export const description = "Download Facebook video from URL";
export const category = "download";

export async function execute(sock, msg, args) {
  if (!args[0]) {
    return sendReply(sock, msg, "❌ Please provide a Facebook video URL.");
  }

  const fbUrl = args[0];

  try {
    const apiRes = await fetch(`https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(fbUrl)}`);
    const data = await apiRes.json();

    if (!data.success || data.status !== 200) {
      return sendReply(sock, msg, "❌ Failed to fetch the video. Make sure the URL is valid.");
    }

    const { title, downloads } = data.result;

    const sdVideo = downloads.sd;
    const hdVideo = downloads.hd;

    // Prepare message text
    const messageText = `
╭─────────────────────
│ 📹 Facebook Video
├─────────────────────
│ 🎬 Title: ${title}
│ 💾 SD Size: ${sdVideo.size} (${sdVideo.quality})
│ 💾 HD Size: ${hdVideo.size} (${hdVideo.quality})
╰─────────────────────
`.trim();

    // Send SD video first
    await sock.sendMessage(msg.key.remoteJid, {
      video: { url: sdVideo.url },
      caption: messageText
    });

  } catch (err) {
    console.error("❌ facedl1 error:", err);
    return sendReply(sock, msg, "❌ An error occurred while downloading the video.");
  }
}
