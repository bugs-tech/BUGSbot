// commands/repo.js
import axios from 'axios';

export const name = 'repo';
export const description = 'Show the BUGS-BOT GitHub repository with stats';
export const category = 'General';

const REPO_URL = 'https://github.com/bugs-tech/BUGSbot';
const API_URL = 'https://api.github.com/repos/bugs-tech/BUGSbot';

export async function execute(sock, msg) {
  const chatId = msg.key.remoteJid;

  try {
    const { data } = await axios.get(API_URL);

    const stars = data.stargazers_count || 0;
    const updatedAt = new Date(data.updated_at).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const caption = `
┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃    🔥 *BUGS-BOT Repo* 🔥
┗━━━━━━━━━━━━━━━━━━━━━━━┛

📦 *GitHub:* ${REPO_URL}

⭐ *Stars:* ${stars}
🛠️ *Last Updated:* ${updatedAt}

🧪 Powered by: *BUGS-BOT Support Tech*
🚀 Fork, Deploy, Modify & Rule!

🔗 *Fork now:* https://github.com/bugs-tech/BUGSbot/fork
`;

    await sock.sendMessage(chatId, { text: caption });
  } catch (err) {
    console.error('Error fetching repo info:', err.message);
    await sock.sendMessage(chatId, {
      text: '❌ Failed to fetch repo info. Please try again later.',
    });
  }
}
