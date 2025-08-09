import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'spotdl';
export const description = 'Download Spotify track audio using GiftedTech SpotifyDLv2 API';
export const usage = '.spotdl <spotify_track_url>';

export async function execute(sock, msg, args) {
  const trackUrl = args.join(' ').trim();
  if (!trackUrl) return sendReply(sock, msg, '❌ Usage: .spotdl <Spotify track URL>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/download/spotifydlv2?apikey=gifted&url=${encodeURIComponent(trackUrl)}`;
    const { data } = await axios.get(apiUrl);

    console.log('SpotifyDL API response:', JSON.stringify(data, null, 2));

    if (!data || !data.success || !data.result) {
      return sendReply(sock, msg, '❌ Failed to fetch Spotify track data. Please check the URL and try again.');
    }

    const { artist, title, album, released, thumbnail, download_url } = data.result;

    if (!download_url) {
      return sendReply(sock, msg, '❌ Could not find download link for the Spotify track.');
    }

    // Boxed style message with track details
    const boxedMsg = `
┌─❒ *Spotify Track Download*
│
├─ *Title:* ${title}
├─ *Artist:* ${artist}
├─ *Album:* ${album}
├─ *Released:* ${released}
│
└─ _Downloading track for you..._`;

    await sendReply(sock, msg, boxedMsg.trim());

    // Send the audio file
    await sock.sendMessage(msg.key.remoteJid, {
      audio: { url: download_url },
      mimetype: 'audio/mpeg',
      fileName: `${artist} - ${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artist,
          mediaUrl: trackUrl,
          thumbnailUrl: thumbnail,
          sourceUrl: trackUrl,
          mediaType: 2
        }
      }
    }, { quoted: msg });

  } catch (err) {
    console.error('[SPOTDL ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to download Spotify track. Please try again later.');
  }
}
