// commands/joke.js
export const name = 'joke';

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the computer go to the doctor? Because it had a virus!",
  "I told my computer I needed a break, and it said 'No problem, I'll go to sleep.'",
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
];

export async function execute(sock, msg, args) {
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  await sock.sendMessage(msg.key.remoteJid, {
    text: `🤣 Joke:\n${joke}`
  }, { quoted: msg });
}
