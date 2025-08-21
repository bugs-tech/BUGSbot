// commands/autotype.js
import fs from 'fs';

export const name = 'autotype';

export async function execute(sock, msg, args, context) {
  const { sendReply, isOwner } = context;

  if (!isOwner) {
    await sendReply('❌ Only bot owner can use this command.');
    return;
  }

  const dbPath = './lib/database.json';
  let db = {};

  // ✅ Safe JSON read with auto-repair
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    console.error('⚠️ database.json was invalid, resetting...', e.message);
    db = {};
  }

  if (!db.autotype) db.autotype = { status: 'off' };

  const option = (args[0] || '').toLowerCase();

  if (!['on', 'off', 'record'].includes(option)) {
    await sendReply('📌 Usage: .autotype on | off | record');
    return;
  }

  if (option === 'off') {
    db.autotype.status = 'off';
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    await sendReply('✅ Auto typing/recording turned OFF.');
    return;
  }

  if (option === 'on') {
    db.autotype.status = 'typing';
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    await sendReply('✍️ Auto Typing mode is ON (bot will appear as typing everywhere).');
    return;
  }

  if (option === 'record') {
    db.autotype.status = 'recording';
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    await sendReply('🎤 Auto Recording mode is ON (bot will appear as recording everywhere).');
    return;
  }
}
