import os from 'os';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import settings from '../settings.js';

const botName = '🔥 BUGS-BOT 🔥';

// ✅ Use a folder of images instead of a single image
const imageFolderPath = './media/menu-images'; // place menu1.jpg, menu2.jpg, etc. here

// Commands grouped by category
const ownerCommands = [
  'autolike','autoviewstatus','autolikestatus','autoreact','autotyping','broadcast',
  'shutdown', 'clearall','restart', 
  'autoread', 'autotyping','addowner','removeowner'
];
const groupCommands = [
  'promote', 'demote', 'kick','lock','unlock', 'mute', 'antilink', 'grouplock','gcbroadcast',
  'setwelcome', 'tagall','ban','warn','listonline','welcome','unmute',
    'clearwarn','gcbroadcast'
];
const generalCommands = ['ping', 'menu','echo','about','joke','roll','owner','repo','whoami'];
const gameCommands = ['rps','ttt','ngg','hangman','wordscramble'];
const imageCommands = ['toimg','blur','rotate','sticker','invert','greyscale','removebg'];
const downloadCommands = ['apkdl','play','song','yta','ytv','ytdl','ytmp3','ytmp4'];
const aiCommands = ['ai', 'ask','chat','img','gimg','gimg1','translate'];
const funCommands = ['bomb','crash','lag','spam'];

// RAM usage info
function getRamUsage() {
  const total = os.totalmem() / 1024 / 1024 / 1024;
  const free = os.freemem() / 1024 / 1024 / 1024;
  const used = total - free;
  return `${used.toFixed(2)} GB/${total.toFixed(2)} GB`;
}

// Speed test
function getSpeedMs() {
  const start = Date.now();
  execSync('node -v');
  const end = Date.now();
  return ((end - start) / 1000).toFixed(4) + 's';
}

// Reply helper
async function sendReply(sock, msg, text, extra = {}) {
  const chatId = msg.key.remoteJid;
  const footer = '\n\n— *BUGS-BOT support tech*';
  await sock.sendMessage(chatId, { text: text + footer, ...extra });
}

export const name = 'menu';
export const description = 'Show all commands grouped by category with style and image';
export const category = 'General';

export async function execute(sock, msg, args) {
  const chatId = msg.key.remoteJid;
  const pushName = msg.pushName || 'User';

  const prefix = settings.prefix || '.';
  const version = settings.version || '1.0.0';

  const ram = getRamUsage();
  const speed = getSpeedMs();

  const ownerCmdsText = ownerCommands.map(cmd => `│★ ${cmd}`).join('\n');
  const groupCmdsText = groupCommands.map(cmd => `│★ ${cmd}`).join('\n');
  const aiCmdsText = aiCommands.map(cmd => `│★ ${cmd}`).join('\n');
  const imageCmdsText = imageCommands.map(cmd => `│★ ${cmd}`).join('\n');
  const downloadCmdsText = downloadCommands.map(cmd => `│★ ${cmd}`).join('\n');
  const generalCmdsText = generalCommands.map(cmd => `│★ ${cmd}`).join('\n');
  const gameCmdsText = gameCommands.map(cmd => `│★ ${cmd}`).join('\n');
  const funCmdsText = funCommands.map(cmd => `│★ ${cmd}`).join('\n');

  const totalCommands = ownerCommands.length + groupCommands.length + gameCommands.length +funCommands.length
    generalCommands.length + downloadCommands.length + imageCommands.length + aiCommands.length;

  const menuText = `
━━━━━《 ${botName} \n MENU 》━━━━━
┃★╭──────────────
┃★┃• ᴜꜱᴇʀ : ${pushName}
┃★┃• ᴍᴏᴅᴇ : Public
┃★┃• ᴘʀᴇғɪx : [ ${prefix} ]
┃★┃• ᴄᴏᴍᴍᴀɴᴅꜱ : ${totalCommands}
┃★┃• ᴠᴇʀꜱɪᴏɴ : ${version}
┃★┃• ʀᴀᴍ : ${ram}
┃★┃• sᴘᴇᴇᴅ : ${speed}
┃★╰──────────────
╰━━━━━━━━━━━━━━━━━━┈⊷

┏━━━━━━━━━━━━━━━▣
┣━━❍「 *OWNER* 」❍
${ownerCmdsText}

┣━━❍「 *GROUP* 」❍
${groupCmdsText}

┣━━❍「 *AI* 」❍
${aiCmdsText}

┣━━❍「 *IMAGE* 」❍
${imageCmdsText}

┣━━❍「 *DOWNLOAD* 」❍
${downloadCmdsText}

┣━━❍「 *GAMES* 」❍
${gameCmdsText}

┣━━❍「 *FUN* 」❍
${funCmdsText}

┣━━❍「 *GENERAL* 」❍
${generalCmdsText}
╰━━━━━━━━━━━━━━━━━━━━━━━▣
`.trim();

  try {
    let imageBuffer = null;

    // Read images from menu folder
    const files = fs.readdirSync(imageFolderPath).filter(file =>
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );

    if (files.length > 0) {
      const randomImage = files[Math.floor(Math.random() * files.length)];
      const imagePath = path.join(imageFolderPath, randomImage);
      imageBuffer = fs.readFileSync(imagePath);
    }

    if (imageBuffer) {
      await sock.sendMessage(chatId, {
        image: imageBuffer,
        caption: menuText
      });
    } else {
      await sendReply(sock, msg, menuText);
    }
  } catch (err) {
    console.error('❌ Failed to send menu:', err);
    await sendReply(sock, msg, '⚠️ Failed to display menu.');
  }
}
