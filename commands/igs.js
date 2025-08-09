import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'igs';
export const description = 'Get Instagram user info';
export const usage = '.igs <username>';

export async function execute(sock, msg, args) {
  const username = args.join(' ').trim();
  if (!username) return sendReply(sock, msg, '❌ Usage: .igs <Instagram username>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/stalk/igstalk?apikey=gifted&username=${encodeURIComponent(username)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.success || !data.result) {
      return sendReply(sock, msg, `❌ Could not find Instagram user *${username}*.`);
    }

    const user = data.result;

    const boxedReply = `
┌─❒ *Instagram User Info*
│
├─ *Name:* ${user.name || 'N/A'} ${user.verified ? '✅' : ''}
├─ *Username:* @${user.username || 'N/A'}
├─ *Bio:* ${user.bio || 'No bio'}
├─ *Followers:* ${Number(user.followers).toLocaleString() || '0'}
├─ *Following:* ${Number(user.following).toLocaleString() || '0'}
├─ *Posts:* ${Number(user.posts).toLocaleString() || '0'}
├─ *Engagement Rate:* ${user.engagement_rate ?? 'N/A'}
└───────────────────────────────`.trim();

    await sendReply(sock, msg, boxedReply, {
      image: { url: user.profile_pic }
    });

  } catch (err) {
    console.error('[IGS ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to get Instagram user info. Please try again later.');
  }
}
