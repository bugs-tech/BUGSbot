// commands/wordscramble.js

export const name = 'wordscramble';
export const description = 'Play Word Scramble game! Unscramble the letters to find the word.';
export const category = 'Games';

const wordList = [
  { word: 'javascript', hint: 'Programming language' },
  { word: 'bicycle', hint: 'Two wheels' },
  { word: 'elephant', hint: 'Largest land animal' },
  { word: 'computer', hint: 'Used to code' },
  { word: 'guitar', hint: 'String instrument' },
  { word: 'mountain', hint: 'High landform' },
  { word: 'pyramid', hint: 'Ancient Egyptian structure' },
  { word: 'rainbow', hint: 'Colors in the sky after rain' },
  { word: 'butterfly', hint: 'Insect with colorful wings' },
  { word: 'chocolate', hint: 'Sweet treat' },
];

const games = new Map();

function shuffle(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;
  const chatId = msg.key.remoteJid;

  let game = games.get(chatId);
  const subcommand = args[0]?.toLowerCase();

  if (!subcommand || subcommand === 'help') {
    logCommand('help', chatId);
    return sendReply(
      `🧩 *Word Scramble Game* 🧩\n\n` +
      `Commands:\n` +
      `• .wordscramble start - Start a new game\n` +
      `• .wordscramble guess <word> - Guess the unscrambled word\n` +
      `• .wordscramble hint - Get a hint\n` +
      `• .wordscramble quit - Quit the current game`
    );
  }

  if (subcommand === 'start') {
    logCommand('start', chatId);
    if (game && game.status === 'playing') {
      return sendReply('⚠️ A game is already in progress! Use `.wordscramble quit` to end it first.');
    }

    const selection = wordList[Math.floor(Math.random() * wordList.length)];
    const scrambled = shuffle(selection.word);

    games.set(chatId, {
      status: 'playing',
      word: selection.word,
      scrambled,
      hint: selection.hint,
      attempts: 0,
    });

    return sendReply(
      `🎉 New Word Scramble game started!\n` +
      `Unscramble this word:\n\n` +
      `*${scrambled.toUpperCase()}*\n\n` +
      `Use \`.wordscramble guess <word>\` to guess.`
    );
  }

  if (!game || game.status !== 'playing') {
    return sendReply('❗ No active game. Start one with `.wordscramble start`.');
  }

  if (subcommand === 'guess') {
    logCommand(`guess ${args[1] || ''}`, chatId);
    if (!args[1]) {
      return sendReply('❗ Please provide a guess.\nExample: `.wordscramble guess bicycle`');
    }

    const guess = args.slice(1).join(' ').toLowerCase();
    game.attempts++;

    if (guess === game.word.toLowerCase()) {
      games.delete(chatId);
      return sendReply(
        `🎊 Correct! The word was *${game.word}*.\n` +
        `You guessed it in *${game.attempts}* attempt(s).\n` +
        `Start a new game with \`.wordscramble start\`.`
      );
    } else {
      return sendReply(
        `❌ Wrong guess! Try again.\n` +
        `Use \`.wordscramble hint\` if you need help.\n` +
        `Attempts: ${game.attempts}`
      );
    }
  }

  if (subcommand === 'hint') {
    logCommand('hint', chatId);
    return sendReply(`💡 Hint: ${game.hint}`);
  }

  if (subcommand === 'quit') {
    logCommand('quit', chatId);
    games.delete(chatId);
    return sendReply('🛑 Game ended. Thanks for playing!\nStart again with `.wordscramble start`.');
  }

  return sendReply('❓ Unknown command. Use `.wordscramble help` for instructions.');
}

function logCommand(action, chatId) {
  console.log(`✅ Command 'wordscramble ${action}' executed successfully.`);
  console.log(`📨 Message from ${chatId}`);
  console.log(`💬 ${chatId} (👥 ${chatId.includes('@g.us') ? 'Group Chat' : 'Private Chat'}): ${chatId}`);
  console.log(`\n— *BUGS-BOT support tech*`);
}
