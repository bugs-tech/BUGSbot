import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'tts';
export const description = 'Get TikTok user info by username using GiftedTech TikTok stalk API';
export const usage = '.tts <username>';

export async function execute(sock, msg, args) {
  const username = args.join(' ').trim();
  if (!username) return sendReply(sock, msg, '❌ Usage: .tts <TikTok username>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/stalk/tiktokstalk?apikey=gifted&username=${encodeURIComponent(username)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.success || !data.result) {
      return sendReply(sock, msg, `❌ Could not find TikTok user *${username}*.`);
    }

    const user = data.result;

    const formatNum = n => n?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const boxedReply = `
┌─❒ *TikTok User Info*
│
├─ *Name:* ${user.name || 'N/A'} ${user.verified ? '✅' : ''}
├─ *Username:* @${user.username || 'N/A'}
├─ *Bio:* ${user.bio || 'No bio'}
├─ *Followers:* ${formatNum(user.followers) || '0'}
├─ *Following:* ${formatNum(user.following) || '0'}
├─ *Likes:* ${formatNum(user.likes) || '0'}
├─ *Website:* ${user.website?.link || 'None'}
├─ *Private Account:* ${user.private ? 'Yes 🔒' : 'No'}
└─----------------------------------------`.trim();

    await sendReply(sock, msg, boxedReply, {
      image: { url: user.avatar }
    });

  } catch (err) {
    console.error('[TTS ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to get TikTok user info. Please try again later.');
  }
}
