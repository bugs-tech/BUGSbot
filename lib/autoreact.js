import fs from 'fs';

const dbPath = './data/database.json';

const emojiList = [
  '😂', '😎', '😅', '🔥', '🥲', '👍', '🤖', '💯',
  '👀', '🤡', '👋', '🙃', '😐', '😮‍💨', '😈', '❤️',
  '🥵', '🗿', '👻', '🤠', '😬', '🤫', '🫣', '🥴',
  '😑', '😳', '😤', '🫠', '😭', '😒', '👌', '🍷'
];

function loadDB() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ autoreact: false }, null, 2));
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function isAutoReactEnabled() {
  const db = loadDB();
  return db.autoreact === true;
}

export function setAutoReact(status) {
  const db = loadDB();
  db.autoreact = status;
  saveDB(db);
}

export function getRandomEmoji() {
  const index = Math.floor(Math.random() * emojiList.length);
  return emojiList[index];
}
