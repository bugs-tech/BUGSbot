export const name = 'whoami';
export const description = 'Debug: show your detected phone number and owner status';

export async function execute(sock, msg, args, context) {
  const { senderNumber, isBotOwner, replyJid } = context;

  await sock.sendMessage(replyJid, {
    text: `Your detected number: ${senderNumber}\nOwner status: ${isBotOwner}`
  });
}
