// commands/ttt.js

export const name = 'ttt';
export const description = 'Play Tic-Tac-Toe with the bot';
export const category = 'Games';

const emptyBoard = [
  [' ', ' ', ' '],
  [' ', ' ', ' '],
  [' ', ' ', ' ']
];

// Render board as text with emojis
function renderBoard(board) {
  return board.map(row => row.map(cell => cell === ' ' ? '⬜' : cell).join(' ')).join('\n');
}

// Check if player has won
function checkWin(board, player) {
  for (let i = 0; i < 3; i++) {
    if (board[i].every(cell => cell === player)) return true;
    if (board[0][i] === player && board[1][i] === player && board[2][i] === player) return true;
  }
  if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
  if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
  return false;
}

// Check if board is full
function isFull(board) {
  return board.every(row => row.every(cell => cell !== ' '));
}

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;
  const chatId = msg.key.remoteJid;

  // Initialize game state per chat in-memory
  if (!global.tttGames) global.tttGames = {};
  if (!global.tttGames[chatId]) {
    global.tttGames[chatId] = {
      board: JSON.parse(JSON.stringify(emptyBoard)),
      playing: true,
    };
  }
  const game = global.tttGames[chatId];

  if (args.length === 0) {
    await sendReply(chatId, `🎮 *Tic Tac Toe*\n\n${renderBoard(game.board)}\n\nMake your move: .ttt <position 1-9>`);
    return;
  }

  if (!game.playing) {
    await sendReply(chatId, `Game over! Start a new game by typing .ttt`);
    return;
  }

  const pos = parseInt(args[0], 10);
  if (!pos || pos < 1 || pos > 9) {
    await sendReply(chatId, '⚠️ Please provide a valid position (1-9).');
    return;
  }

  // Convert position to board coordinates
  const row = Math.floor((pos - 1) / 3);
  const col = (pos - 1) % 3;

  if (game.board[row][col] !== ' ') {
    await sendReply(chatId, '⚠️ That position is already taken.');
    return;
  }

  // Player is always X
  game.board[row][col] = 'X';

  if (checkWin(game.board, 'X')) {
    game.playing = false;
    await sendReply(chatId, `🎉 You won!\n\n${renderBoard(game.board)}`);
    return;
  }

  if (isFull(game.board)) {
    game.playing = false;
    await sendReply(chatId, `🤝 It's a draw!\n\n${renderBoard(game.board)}`);
    return;
  }

  // Bot random move O
  let emptyPositions = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (game.board[r][c] === ' ') emptyPositions.push({ r, c });
    }
  }
  const botMove = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  game.board[botMove.r][botMove.c] = 'O';

  if (checkWin(game.board, 'O')) {
    game.playing = false;
    await sendReply(chatId, `💻 Bot wins!\n\n${renderBoard(game.board)}`);
    return;
  }

  if (isFull(game.board)) {
    game.playing = false;
    await sendReply(chatId, `🤝 It's a draw!\n\n${renderBoard(game.board)}`);
    return;
  }

  await sendReply(chatId, `Your move:\n\n${renderBoard(game.board)}\n\nUse .ttt <position 1-9> to play.`);
}
