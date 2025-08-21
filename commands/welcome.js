import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

export const name = "welcome";
export const description = "Toggle welcome messages for the group";
export const category = "group";

// --- Database setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../lib/welcome.json");

// --- Load and save DB ---
function loadDB() {
  try {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch (err) {
    console.error("Error loading welcome.json:", err);
    return {};
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Error saving welcome.json:", err);
  }
}

// --- Send reply helper ---
async function sendReply(sock, jid, text, extra = {}) {
  const tag = "\n\n— *BUGS-BOT support tech*";
  try {
    await sock.sendMessage(jid, { text: text + tag, ...extra });
  } catch (err) {
    console.error("❌ sendReply failed:", err);
  }
}

// --- Command execution ---
export async function execute(sock, msg, args) {
  const groupId = msg.key.remoteJid;
  if (!groupId.endsWith("@g.us"))
    return sendReply(sock, groupId, "❌ This command only works in groups.");

  let metadata;
  try {
    metadata = await sock.groupMetadata(groupId);
  } catch {
    return sendReply(sock, groupId, "❌ Failed to fetch group metadata.");
  }

  const sender = msg.key.participant || msg.participant || groupId;
  const admins = metadata.participants.filter(p => p.admin);

  if (!admins.some(p => p.id === sender))
    return sendReply(sock, groupId, "❌ Only group admins can use this command.");

  const db = loadDB();
  const toggle = args[0]?.toLowerCase();

  if (!toggle || !["on", "off"].includes(toggle))
    return sendReply(sock, groupId, "Usage: `welcome on` or `welcome off`");

  db[groupId] = toggle === "on";
  saveDB(db);

  return sendReply(
    sock,
    groupId,
    toggle === "on" ? "✅ Welcome messages enabled." : "❌ Welcome messages disabled."
  );
}

// --- Group participant updates ---
export async function onGroupParticipantsUpdate(sock, update) {
  const db = loadDB();
  const groupId = update.id;
  if (!db[groupId]) return; // Welcome disabled

  let metadata;
  try {
    metadata = await sock.groupMetadata(groupId);
  } catch {
    return;
  }

  const { subject: groupName = "Unknown Group", desc: groupDesc = "" } = metadata;
  const memberCount = metadata.participants.length;

  // Fetch group profile picture
  let ppBuffer;
  try {
    const ppUrl = await sock.profilePictureUrl(groupId, "image");
    if (ppUrl) {
      const res = await fetch(ppUrl);
      const arrayBuffer = await res.arrayBuffer();
      ppBuffer = Buffer.from(arrayBuffer);
    }
  } catch (err) {
    console.warn("⚠️ Could not fetch group profile picture:", err);
    ppBuffer = null; // fallback: no image
  }

  const date = new Date().toLocaleString("en-GB");

  for (const participant of update.participants) {
    let userName = participant.split("@")[0];
    try {
      const [userData] = await sock.onWhatsApp(participant);
      if (userData?.notify) userName = userData.notify;
    } catch {}

    const actionText = update.action === "add" ? "🎉 JOINED" : "💔 LEFT";

    const messageText = `
╭─────────•✧•─────────╮
│ 💻 BUGS-TECH Bot
├─────────•✧•─────────╮
│ ${actionText} GROUP NOTIFICATION
├─────────•✧•─────────╤
│ 👤 User: ${userName}
│ 🏷️ Group: ${groupName}
│ 🔢 Members: ${memberCount}
│ 📅 Date: ${date}
${groupDesc ? `│ 📝 Desc: ${groupDesc}` : ""}
╰─────────•✧•─────────╯
`.trim();

    // Send welcome message with group profile picture if available
    const messageOptions = { text: messageText, mentions: [participant] };
    if (ppBuffer) {
      messageOptions.image = { buffer: ppBuffer, mimetype: "image/jpeg" };
    }

    await sendReply(sock, groupId, messageText, messageOptions);
  }
}
