// commands/ngg.js

export const name = 'ngg';
export const description = 'Play a Number Guessing Game!';
export const category = 'Games';

// Store game state per chat
const games = new Map();

export async function execute(sock, msg, args, context) {
  const { senderJid, sendReply } = context;
  const chatId = msg.key.remoteJid;

  // Helper to generate random number between min and max inclusive
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let game = games.get(chatId);

  // Commands: start, guess <number>, quit
  const subcommand = args[0]?.toLowerCase();

  if (!subcommand || subcommand === 'help') {
    return sendReply(chatId,
      `🎲 *Number Guessing Game* 🎲\n\n` +
      `Commands:\n` +
      `• .ngg start - Start a new game\n` +
      `• .ngg guess <number> - Guess a number\n` +
      `• .ngg quit - Quit the current game`
    );
  }

  if (subcommand === 'start') {
    if (game && game.status === 'playing') {
      return sendReply(chatId, '⚠️ A game is already running! Use .ngg quit to stop it.');
    }
    const secretNumber = getRandomInt(1, 100);
    games.set(chatId, { secretNumber, attempts: 0, status: 'playing' });
    return sendReply(chatId,
      '🎉 New Number Guessing Game started!\n' +
      'Guess the secret number between 1 and 100.\n' +
      'Use `.ngg guess <number>` to make a guess.'
    );
  }

  if (!game || game.status !== 'playing') {
    return sendReply(chatId, '❗ No active game. Start one with `.ngg start`.');
  }

  if (subcommand === 'guess') {
    if (!args[1]) {
      return sendReply(chatId, '❗ Please provide a number to guess.\nExample: `.ngg guess 42`');
    }
    const guess = parseInt(args[1], 10);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      return sendReply(chatId, '❗ Your guess must be a number between 1 and 100.');
    }

    game.attempts++;

    if (guess === game.secretNumber) {
      games.delete(chatId);
      return sendReply(chatId,
        `🎊 Congratulations! You guessed the number *${game.secretNumber}* correctly in *${game.attempts}* attempts.\n` +
        'Start a new game with `.ngg start`.'
      );
    } else if (guess < game.secretNumber) {
      return sendReply(chatId, `🔼 Too low! Try a higher number.\nAttempts: ${game.attempts}`);
    } else {
      return sendReply(chatId, `🔽 Too high! Try a lower number.\nAttempts: ${game.attempts}`);
    }
  }

  if (subcommand === 'quit') {
    if (!game) {
      return sendReply(chatId, '❗ No game to quit.');
    }
    games.delete(chatId);
    return sendReply(chatId, '🛑 Game ended. Thanks for playing!\nStart a new one anytime with `.ngg start`.');
  }

  return sendReply(chatId, '❓ Unknown command. Use `.ngg help` for instructions.');
}
