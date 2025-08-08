// lib/autochatbot.js
import fs from 'fs';
import axios from 'axios';
const dbPath = './data/database.json';

let database = {};
try {
  database = JSON.parse(fs.readFileSync(dbPath));
} catch {
  database = { chatbot: {} };
}

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
}

export function isChatbotOn(number) {
  return database.chatbot?.[number] === true;
}

export function toggleChatbot(number, state) {
  if (!database.chatbot) database.chatbot = {};
  database.chatbot[number] = state;
  saveDB();
  return state;
}

export async function handleChatbotReply(sock, msg, text, number) {
  try {
    const apiURL = `https://api.giftedtech.co.ke/api/ai/gpt?apikey=gifted&q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiURL);

    // Remove "Powered by GiftedTech" if present
    const cleanReply = data?.response?.replace(/_?Powered by GiftedTech.*$/i, '').trim();

    if (cleanReply) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *AI Response:*\n\n${cleanReply}` });
    }
  } catch (err) {
    console.error('❌ Chatbot API error:', err);
    await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Failed to get a response from chatbot.' });
  }
}
