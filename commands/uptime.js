import os from 'os';

export const name = 'uptime';
export const description = 'Shows bot uptime and system info';
export const category = 'Info';

export async function execute(sock, msg, args, context) {
  const { getName, senderJid, sendReply } = context;
  const chatId = msg.key.remoteJid;

  // Get display name with fallback
  let userName = await getName(senderJid);
  if (!userName) userName = senderJid.split('@')[0];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-GB');

  const uptimeSec = process.uptime();
  const pad = (n) => n.toString().padStart(2, '0');
  const hours = pad(Math.floor(uptimeSec / 3600));
  const minutes = pad(Math.floor((uptimeSec % 3600) / 60));
  const seconds = pad(Math.floor(uptimeSec % 60));
  const uptimeStr = `${hours}:${minutes}:${seconds}`;

  const totalMemMB = (os.totalmem() / 1024 / 1024).toFixed(2);
  const freeMemMB = (os.freemem() / 1024 / 1024).toFixed(2);

  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model || 'Unknown';
  const cpuSpeed = cpus[0]?.speed || 'Unknown';

  // Compose message with mention tag
  const messageLines = [
    '╭─「 🤖 Bot Uptime Info 」',
    `│ 📅 Date: ${dateStr}`,
    `│ ⏰ Time: ${timeStr}`,
    `│ 👤 User: ${userName}`,  // mention by username
    `│ ⏳ Uptime: ${uptimeStr}`,
    `│ 🖥️ Processor: ${cpuModel}`,
    `│ ⚡ Speed: ${cpuSpeed} MHz`,
    `│ 💾 RAM: ${freeMemMB} MB free / ${totalMemMB} MB total`,
    '╰───────────────────────'
  ];

  // send with mention metadata
  await sock.sendMessage(chatId, { text: message }, { quoted: msg });
}
