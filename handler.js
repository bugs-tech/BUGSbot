import * as fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import fetch from 'node-fetch';
import settings from './settings.js';
import { isAutoReactEnabled, getRandomEmoji } from './data/features.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = new Map();
export const dynamicOwners = new Set(
  settings.botOwnerNumbers.map(num => num.replace(/\D/g, ''))
);

// --- Database setup ---
const dbPath = path.join('./data', 'database.json');
let database = {};
try {
  database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  database.autoreact ??= false;
  database.autostatusreact ??= false;
  database.owners ??= [];
  database.notifications ??= {};
  database.welcome ??= {};
} catch (e) {
  console.warn('⚠️ Failed to load database.json, using defaults');
  database = { autoreact: false, autostatusreact: false, owners: [], notifications: {}, welcome: {} };
}

function saveDatabase() {
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
}

function isOwner(jid) {
  if (!jid) return false;
  const normalized = jid.replace(/\D/g, '');
  return (
    settings.botOwnerNumbers.some(n => n.replace(/\D/g, '') === normalized) ||
    database.owners.includes(normalized + '@s.whatsapp.net') ||
    dynamicOwners.has(normalized)
  );
}

// --- Load commands dynamically ---
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  if (command.name) commands.set(command.name, command);
}

// --- Presence map ---
const presenceMap = new Map();

// --- Send reply utility ---
async function sendReply(sock, jid, text, extra = {}) {
  const tag = '\n\n— *BUGS-BOT support tech*';
  try { return await sock.sendMessage(jid, { text: text + tag, ...extra }); }
  catch (e) { console.error('❌ sendReply failed:', e); }
}

// --- Command handler ---
export async function handleCommand(sock, msg) {
  if (!presenceMap.has('init')) {
    presenceMap.set('init', true);
    sock.ev.on('presence-update', update => presenceMap.set(update.id, update));
  }

  const prefix = settings.prefix || '.';
  if (msg.key.remoteJid === 'status@broadcast') return;

  const fromMe = msg.key.fromMe;
  const isGroup = msg.key.remoteJid.endsWith('@g.us');

  // Extract message text
  let text = msg.message?.conversation
    || msg.message?.extendedTextMessage?.text
    || msg.message?.imageMessage?.caption
    || msg.message?.videoMessage?.caption
    || msg.message?.documentMessage?.caption
    || msg.message?.buttonsResponseMessage?.selectedButtonId
    || msg.message?.templateButtonReplyMessage?.selectedId
    || (msg.message ? '[Non-text message received]' : '[Empty message]');

  // Auto-react
  if (isAutoReactEnabled()) {
    const emoji = getRandomEmoji();
    try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }); }
    catch (e) { console.error('Auto-react error:', e); }
  }

  if (fromMe && !settings.allowSelfCommands && text.startsWith(prefix)) return;

  const senderName = msg.pushName || msg.key.participant || msg.key.remoteJid || 'Unknown';
  let groupName = '';
  if (isGroup) {
    try { groupName = (await sock.groupMetadata(msg.key.remoteJid)).subject; } 
    catch { groupName = '[Unknown Group]'; }
  }

  console.log(`💬 ${chalk.yellow(senderName)} (${isGroup ? chalk.blueBright(`👥 ${groupName}`) : fromMe ? chalk.gray('🤖 Self Chat') : chalk.magenta('👤 Private Chat')}): ${chalk.green(text)}`);

  if (!text.startsWith(prefix)) return;

  const args = text.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  // --- WELCOME TOGGLE ---
  if (commandName === "welcome" && isGroup) {
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const isAdmin = metadata.participants.some(p => p.id === msg.key.participant && p.admin);
    if (!isAdmin) return sendReply(sock, msg.key.remoteJid, "❌ Only group admins can toggle welcome.");

    const toggle = args[0]?.toLowerCase();
    if (!toggle || !["on", "off"].includes(toggle)) return sendReply(sock, msg.key.remoteJid, `Usage: ${prefix}welcome <on/off>`);

    database.welcome[msg.key.remoteJid] = toggle === "on";
    saveDatabase();

    console.log(chalk.cyan(`[WELCOME TOGGLE] Group ${msg.key.remoteJid} set to ${toggle}`));
    return sendReply(sock, msg.key.remoteJid, toggle === "on" ? "✅ Welcome message enabled." : "❌ Welcome message disabled.");
  }

  // --- Execute other commands ---
  const rawSenderJid = isGroup ? msg.key.participant : (msg.key.fromMe ? sock.user.id : msg.key.remoteJid);
  let resolvedJid = rawSenderJid;
  try { const resolved = await sock.onWhatsApp(rawSenderJid); if (resolved?.[0]?.jid) resolvedJid = resolved[0].jid; } 
  catch (err) { console.warn('⚠️ Could not resolve JID:', err); }

  const normalize = num => num.replace(/\D/g, '');
  const normalizedSender = normalize(resolvedJid);
  const isBotOwner = settings.botOwnerNumbers.some(n => normalize(n) === normalizedSender) || database.owners.includes(resolvedJid) || dynamicOwners.has(normalizedSender);

  if (fromMe && !dynamicOwners.has(normalizedSender)) {
    dynamicOwners.add(normalizedSender);
    console.log(`🆕 Added ${normalizedSender} as dynamic owner`);
  }

  const sessionPath = path.join('sessions', 'cred.js');
  if (!fs.existsSync(sessionPath)) return sendReply(sock, msg.key.remoteJid, `❌ *Access Denied*\n\nYour session is not active.`);

  const banPath = './data/banned.json';
  if (fs.existsSync(banPath)) {
    const banned = JSON.parse(fs.readFileSync(banPath));
    if (Array.isArray(banned) && banned.includes(resolvedJid)) return;
  }

  if (settings.autoTyping) {
    await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || msg.message?.contextInfo?.mentionedJid || [];

  if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    args.quoted = {
      key: {
        remoteJid: msg.message.extendedTextMessage.contextInfo.remoteJid || msg.key.remoteJid,
        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
        fromMe: false,
        participant: msg.message.extendedTextMessage.contextInfo.participant
      },
      message: msg.message.extendedTextMessage.contextInfo.quotedMessage
    };
  }

  async function getName(jid) {
    try {
      const contacts = await sock.onWhatsApp(jid);
      if (contacts?.length) return contacts[0].notify || contacts[0].vname || contacts[0].name || null;
    } catch {}
    return null;
  }

  const command = commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(sock, msg, args, {
      senderJid: resolvedJid,
      senderNumber: normalizedSender,
      isGroup,
      isBotOwner,
      replyJid: msg.key.remoteJid,
      mentionedJid,
      sendReply: (text, extra) => sendReply(sock, msg.key.remoteJid, text, extra),
      isOwner: isOwner(resolvedJid),
      getName,
      presenceMap,
    });
    console.log(chalk.greenBright(`✅ Command '${commandName}' executed successfully.`));
  } catch (err) {
    console.error(chalk.bgRed.white(`❌ Error executing ${commandName}:`), err);
    await sendReply(sock, msg.key.remoteJid, `⚠️ An error occurred while executing *${commandName}*.`);
  }
}

// --- Auto-react to status ---
export async function handleStatus(sock, msg) {
  if (msg.key.remoteJid === 'status@broadcast') {
    const senderJid = msg.key.participant || '';
    if (database.autostatusreact && isOwner(senderJid)) {
      try {
        const randomEmojis = ['❤️','😂','👍','🔥','😊','😎','💯','🤖'];
        const reactEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
        await sock.sendMessage('status@broadcast', { react: { text: reactEmoji, key: msg.key } });
        console.log(`✅ Auto-reacted to a status with ${reactEmoji}`);
      } catch (err) { console.error('❌ Failed to auto-react to status:', err); }
    }
  }
}

// --- Fancy Welcome / Goodbye Handler ---
export async function handleGroupParticipantUpdate(sock, update) {
  const { id: groupId, participants, action } = update;
  if (!(database.welcome && database.welcome[groupId])) return;
  if (!participants || participants.length === 0) return;

  let metadata;
  try { metadata = await sock.groupMetadata(groupId); } 
  catch { metadata = { subject: 'Unknown Group', desc: 'No description', participants: [] }; }

  const groupName = metadata.subject || 'Unknown Group';
  const groupDesc = metadata.desc || 'No description';
  const memberCount = metadata.participants.length;

  let ppBuffer = null;
  try {
    const ppUrl = await sock.profilePictureUrl(groupId, 'image');
    if (ppUrl) {
      const res = await fetch(ppUrl);
      if (res.ok) ppBuffer = Buffer.from(await res.arrayBuffer());
    }
  } catch {}

  const date = new Date().toLocaleString('en-GB');

  for (const user of participants) {
    let userName = user.split("@")[0];
    try {
      const [userData] = await sock.onWhatsApp(user);
      if (userData?.notify) userName = userData.notify;
    } catch {}

    const actionText = action === 'add' ? '🎉 JOINED' : '💔 LEFT';
    const messageText = `
╭─────────•✧•─────────╮
│ ${actionText} GROUP NOTIFICATION
├─────────•✧•─────────╤
│ 👤 User: @${userName}
│ 🏷️ Group: ${groupName}
│ 🔢 Members: ${memberCount}
│ 📅 Date: ${date}
│ 📝 Desc: ${groupDesc}
╰─────────•✧•─────────╯
`.trim();

    const messagePayload = { text: messageText, mentions: [user] };
    if (ppBuffer) {
      messagePayload.image = ppBuffer;
      messagePayload.mimetype = 'image/jpeg';
    }

    await sock.sendMessage(groupId, messagePayload);
  }
}

// --- Init group listeners ---
export function initGroupListeners(sock) {
  sock.ev.on('group-participants.update', update => handleGroupParticipantUpdate(sock, update));
}
