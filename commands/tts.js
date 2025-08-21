// commands/ttt.js
import { sendReply } from '../lib/sendReply.js';

export const name = 'ttt';
export const description = 'Tic Tac Toe game for two players';
export const usage = 'ttt | ttt start | ttt join | ttt <position>';

let game = null;

function renderBoard(board) {
  return `
 ${board[0]} | ${board[1]} | ${board[2]}
-----------
 ${board[3]} | ${board[4]} | ${board[5]}
-----------
 ${board[6]} | ${board[7]} | ${board[8]}
  `.trim();
}

function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of wins) {
    if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== ' ')) return 'draw';
  return null;
}

export async function execute(sock, msg, args) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const input = args[0]?.toLowerCase();

  // No argument -> show hint
  if (!input) {
    return sendReply(sock, msg, `🎮 *Tic Tac Toe Instructions* 🎮\n\n` +
      `• *ttt start* → Start a new game\n` +
      `• *ttt join* → Join a waiting game\n` +
      `• *ttt <1-9>* → Make a move (positions are numbered left to right)\n\n` +
      `Example: *ttt 5* will place your mark in the middle.\n\n` +
      `Game resets after a win or draw.`);
  }

  // Start game
  if (input === 'start') {
    if (game) return sendReply(sock, msg, '⚠️ A game is already running.');
    game = {
      board: Array(9).fill(' '),
      players: [sender],
      turn: 0
    };
    return sendReply(sock, msg, '✅ Game started!\nWaiting for second player... (type *ttt join*)');
  }

  // Join game
  if (input === 'join') {
    if (!game) return sendReply(sock, msg, '⚠️ No active game. Start one with *ttt start*.');
    if (game.players.length >= 2) return sendReply(sock, msg, '⚠️ Game already has 2 players.');
    if (game.players.includes(sender)) return sendReply(sock, msg, '⚠️ You are already in the game.');
    
    game.players.push(sender);
    return sendReply(sock, msg, `✅ Second player joined!\n\n` +
      `Player 1: X\nPlayer 2: O\n\n` +
      `*${game.players[game.turn]}* goes first.\n\n` +
      renderBoard(game.board));
  }

  // Moves
  if (/^[1-9]$/.test(input)) {
    if (!game) return sendReply(sock, msg, '⚠️ No active game. Start with *ttt start*.');
    if (!game.players.includes(sender)) return sendReply(sock, msg, '⚠️ You are not part of this game.');
    if (game.players.length < 2) return sendReply(sock, msg, '⚠️ Waiting for second player to join.');

    const pos = parseInt(input) - 1;
    if (game.board[pos] !== ' ') return sendReply(sock, msg, '❌ That spot is already taken.');

    const currentPlayer = game.players[game.turn];
    if (sender !== currentPlayer) return sendReply(sock, msg, '❌ Not your turn.');

    game.board[pos] = game.turn === 0 ? 'X' : 'O';

    // Check winner
    const winner = checkWinner(game.board);
    if (winner) {
      if (winner === 'draw') {
        await sendReply(sock, msg, `🤝 It's a *draw*!\n\n${renderBoard(game.board)}`);
      } else {
        await sendReply(sock, msg, `🎉 Player ${game.turn + 1} (*${sender}*) wins!\n\n${renderBoard(game.board)}`);
      }
      game = null; // Reset
      return;
    }

    // Switch turn
    game.turn = game.turn === 0 ? 1 : 0;
    return sendReply(sock, msg, `Next turn: *Player ${game.turn + 1}* (*${game.players[game.turn]}*)\n\n${renderBoard(game.board)}`);
  }

  return sendReply(sock, msg, '❌ Invalid command. Type *ttt* to see instructions.');
}
