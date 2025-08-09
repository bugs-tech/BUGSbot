import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'ghs';
export const description = 'GitHub profile stalker';
export const usage = '.ghs <github username>';

export async function execute(sock, msg, args) {
  const username = args.join(' ').trim();
  if (!username) return sendReply(sock, msg, '❌ Usage: .ghs <github username>');

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/githubStalk?user=${encodeURIComponent(username)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.username) return sendReply(sock, msg, `❌ GitHub user *${username}* not found.`);

    const user = data;

    const boxedReply = `
┌─❒ *GitHub Profile Info*
│
├─ *Username:* ${user.username}
├─ *Name:* ${user.nickname || 'N/A'}
├─ *Bio:* ${user.bio || 'N/A'}
├─ *Location:* ${user.location || 'N/A'}
├─ *Public Repos:* ${user.public_repositories}
├─ *Followers:* ${user.followers}
├─ *Following:* ${user.following}
├─ *Created At:* ${new Date(user.created_at).toDateString()}
├─ *Profile URL:* ${user.url}
└─────────────────────────────`.trim();

    await sendReply(sock, msg, boxedReply, {
      image: { url: user.profile_pic }
    });

  } catch (err) {
    console.error('[GHS ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to fetch GitHub user info. Please try again later.');
  }
}
