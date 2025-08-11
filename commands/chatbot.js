import fs from 'fs';
import path from 'path';

export const name = 'chatbot';

export async function execute(sock, msg, args, context) {
  const { sendReply, isBotOwner, database } = context;

  if (!isBotOwner) {
    await sendReply(sock, msg, '❌ Only the bot owner can toggle the chatbot.');
    return;
  }

  if (!args.length) {
    await sendReply(sock, msg, `❌ Usage: ${context.prefix || '.'}chatbot <on|off>`);
    return;
  }

  const choice = args[0].toLowerCase();
  if (choice === 'on') {
    database.chatbot.enabled = true;
    saveDatabase(database);
    await sendReply(sock, msg, '✅ Chatbot is now *ON* for private chats.');
  } else if (choice === 'off') {
    database.chatbot.enabled = false;
    saveDatabase(database);
    await sendReply(sock, msg, '✅ Chatbot is now *OFF* for private chats.');
  } else {
    await sendReply(sock, msg, `❌ Usage: ${context.prefix || '.'}chatbot <on|off>`);
  }
}

function saveDatabase(db) {
  const dbPath = path.join('./data', 'database.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}
