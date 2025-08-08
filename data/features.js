import fs from 'fs';

const dbPath = './data/database.json';

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch {
    return { autoreact: false };
  }
}

export function isAutoReactEnabled() {
  const db = loadDB();
  return !!db.autoreact;
}

export function getRandomEmoji() {
  const emojis = ['😂', '🔥', '❤️', '👍', '😂', '😎', '😅', '🔥', '🥲', '👍', '🤖', '💯',
  '👀', '🤡', '👋', '🙃', '😐', '😮‍💨', '😈', '❤️',
  '🥵', '🗿', '👻', '🤠', '😬', '🤫', '🫣', '🥴',
  '😑', '😳', '😤', '🫠', '😭', '😒', '👌', '🍷',
   '😎', '💯', '😅', '🤖', '🥳', '🤯','😂', '🔥', 
  '💀', '👍', '😎', '😁', '🤖', '👀', '🥲', '😱'
  , '💯', '🙃', '🤡', '✨'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}
