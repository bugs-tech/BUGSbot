import fs from 'fs';
import path from 'path';

export const name = 'pair';
export const description = 'Generate a pairing code for a given number';
export const category = 'utility';

const pairingsPath = path.join('./data', 'pairings.json');

function loadPairings() {
  try {
    if (!fs.existsSync(pairingsPath)) {
      fs.writeFileSync(pairingsPath, '{}', 'utf8');
      return {};
    }
    const raw = fs.readFileSync(pairingsPath, 'utf8');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading pairings:', err);
    return {};
  }
}

function savePairings(data) {
  try {
    fs.writeFileSync(pairingsPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving pairings:', err);
  }
}

function generateCode() {
  const prefix = 'BUGS';
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${number}`;
}

export async function execute(sock, msg, args, context) {
  // Use the remoteJid (chat id) to send reply in the chat where command was called
  const { sendReply } = context;
  const chatId = msg.key.remoteJid;

  if (args.length !== 1 || !/^\d{8,15}$/.test(args[0])) {
    return sendReply(`❌ Invalid format.\nUsage: *.pair 237XXXXXXXXX*`, { jid: chatId });
  }

  const phoneNumber = args[0];
  const pairings = loadPairings();

  if (pairings[phoneNumber]) {
    return sendReply(`🔑 Pairing code for *${phoneNumber}* already exists:\n\n*${pairings[phoneNumber]}*`, { jid: chatId });
  }

  const code = generateCode();
  pairings[phoneNumber] = code;
  savePairings(pairings);

  return sendReply(`✅ Pairing code for *${phoneNumber}*:\n\n*${code}*\n\nUse this code in your bot's panel or client to complete the connection.`, { jid: chatId });
}
