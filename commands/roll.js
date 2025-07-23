// commands/roll.js
export const name = 'roll';

export async function execute(sock, msg, args) {
  const roll = Math.floor(Math.random() * 6) + 1;
  await sock.sendMessage(msg.key.remoteJid, {
    text: `🎲 You rolled a *${roll}*!`
  }, { quoted: msg });
}
