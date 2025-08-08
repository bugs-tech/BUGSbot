import fs from 'fs';
import path from 'path';

export const name = 'pair';
export const description = 'Generate a pairing code for a given number';
export const category = 'utility';

const pairingsPath = './data/pairings.json';

function loadPairings() {
  if (fs.existsSync(pairingsPath)) {
    return JSON.parse(fs.readFileSync(pairingsPath));
  }
  return {};
}

function savePairings(data) {
  fs.writeFileSync(pairingsPath, JSON.stringify(data, null, 2));
}

function generateCode() {
  const prefix = 'BUGS';
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${number}`;
}

export async function execute(sock, msg, args, context) {
  const { senderJid, sendReply } = context;

  if (args.length !== 1 || !/^\d{8,15}$/.test(args[0])) {
    return sendReply(senderJid, '❌ Invalid format.\nUsage: *.pair 237XXXXXXXXX*');
  }

  const phoneNumber = args[0];
  const pairings = loadPairings();

  if (pairings[phoneNumber]) {
    return sendReply(senderJid, `🔑 Pairing code for *${phoneNumber}* already exists:\n\n*${pairings[phoneNumber]}*`);
  }

  const code = generateCode();
  pairings[phoneNumber] = code;
  savePairings(pairings);

  return sendReply(senderJid, `✅ Pairing code for *${phoneNumber}*:\n\n*${code}*\n\nUse this code in your bot's panel or client to complete the connection.`);
}
