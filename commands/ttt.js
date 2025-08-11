// commands/ttt.js

import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

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

// Custom sendReply with footer channel link
async function sendTttReply(sock, msg, text) {
  const message = generateWAMessageFromContent(
    msg.key.remoteJid,
    {
      extendedTextMessage: {
        text: text,
        contextInfo: {
          externalAdReply: {
            title: "🎯 Tic-Tac-Toe",
            body: "View Channel",
            mediaType: 1,
            thumbnailUrl: "", // optional thumbnail image
            sourceUrl: "https://whatsapp.com/channel/0029Vb5p1DHI7Be7UmI7BW0f",
            renderLargerThumbnail: false
          }
        }
      }
    },
    { quoted: msg }
  );

  await sock.relayMessage(msg.key.remoteJid, message.message, { messageId: message.key.id });
}

export async function execute(sock, msg, args) {
  const chatId = msg.key.remoteJid;

  if (!global.tttGames) global.tttGames = {};
  if (!global.tttGames[chatId]) {
    global.tttGames[chatId] = {
      board: JSON.parse(JSON.stringify(emptyBoard)),
      playing: true,
    };
  }
  const game = global.tttGames[chatId];

  if (args.length === 0) {
    await sendTttReply(sock, msg, `🎮 *Tic Tac Toe*\n\n${renderBoard(game.board)}\n\nMake your move: .ttt <position 1-9>`);
    return;
  }

  if (!game.playing) {
    await sendTttReply(sock, msg, `Game over! Start a new game by typing .ttt`);
    return;
  }

  const pos = parseInt(args[0], 10);
  if (!pos || pos < 1 || pos > 9) {
    await sendTttReply(sock, msg, '⚠️ Please provide a valid position (1-9).');
    return;
  }

  const row = Math.floor((pos - 1) / 3);
  const col = (pos - 1) % 3;

  if (game.board[row][col] !== ' ') {
    await sendTttReply(sock, msg, '⚠️ That position is already taken.');
    return;
  }

  // Player move (X)
  game.board[row][col] = 'X';

  if (checkWin(game.board, 'X')) {
    game.playing = false;
    await sendTttReply(sock, msg, `🎉 You won!\n\n${renderBoard(game.board)}`);
    return;
  }

  if (isFull(game.board)) {
    game.playing = false;
    await sendTttReply(sock, msg, `🤝 It's a draw!\n\n${renderBoard(game.board)}`);
    return;
  }

  // Bot move (O)
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
    await sendTttReply(sock, msg, `💻 Bot wins!\n\n${renderBoard(game.board)}`);
    return;
  }

  if (isFull(game.board)) {
    game.playing = false;
    await sendTttReply(sock, msg, `🤝 It's a draw!\n\n${renderBoard(game.board)}`);
    return;
  }

  await sendTttReply(sock, msg, `Your move:\n\n${renderBoard(game.board)}\n\nUse .ttt <position 1-9> to play.`);
}
