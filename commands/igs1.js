import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'igs1';
export const description = 'Get Instagram user info (alternative)';
export const usage = '.igs1 <username>';

export async function execute(sock, msg, args) {
  const username = args.join(' ').trim();
  if (!username) return sendReply(sock, msg, '❌ Usage: .igs1 <Instagram username>');

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/igstalk?username=${encodeURIComponent(username)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.usrname) {
      return sendReply(sock, msg, `❌ Could not find Instagram user *${username}*.`);
    }

    const user = data;
    const stats = user.status || {};

    const boxedReply = `
┌─❒ *Instagram User Info*
│
├─ *Username:* @${user.usrname}
├─ *Posts:* ${stats.post || 'N/A'}
├─ *Followers:* ${stats.follower || 'N/A'}
├─ *Following:* ${stats.following || 'N/A'}
├─ *Bio:* ${user.desk || 'No bio'}
└───────────────────────────────`.trim();

    await sendReply(sock, msg, boxedReply, {
      image: { url: user.pp }
    });

  } catch (err) {
    console.error('[IGS1 ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to get Instagram user info. Please try again later.');
  }
}
