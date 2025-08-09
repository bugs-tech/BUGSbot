import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'tts1';
export const description = 'Get TikTok user info via David Cyril API';
export const usage = '.tts1 <username>';

export async function execute(sock, msg, args) {
  const username = args.join(' ').trim();
  if (!username) return sendReply(sock, msg, '❌ Usage: .tts1 <TikTok username>');

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/tiktokStalk?q=${encodeURIComponent(username)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.status || !data.data?.user) {
      return sendReply(sock, msg, `❌ Could not find TikTok user *${username}*.`);
    }

    const user = data.data.user;
    const stats = data.data.statsV2 || data.data.stats || {};

    // Format numbers with commas
    const formatNum = n => n?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const boxedReply = `
┌─❒ *TikTok User Info*
│
├─ *Name:* ${user.nickname || 'N/A'} ${user.verified ? '✅' : ''}
├─ *Username:* @${user.uniqueId || 'N/A'}
├─ *Bio:* ${user.signature || 'No bio'}
├─ *Followers:* ${formatNum(stats.followerCount) || '0'}
├─ *Following:* ${formatNum(stats.followingCount) || '0'}
├─ *Likes:* ${formatNum(stats.heartCount || stats.heart) || '0'}
├─ *Videos:* ${formatNum(stats.videoCount) || '0'}
├─ *Website:* ${user.bioLink?.link || 'None'}
├─ *Private Account:* ${user.privateAccount ? 'Yes 🔒' : 'No'}
└───────────────────────────────`.trim();

    await sendReply(sock, msg, boxedReply, {
      image: { url: user.avatarLarger || user.avatarMedium || user.avatarThumb }
    });

  } catch (err) {
    console.error('[TTS1 ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to get TikTok user info. Please try again later.');
  }
}
