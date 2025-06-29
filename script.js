
  const HUMAN = 'X';
  const AI = 'O';
  const EMPTY = '';

  let board;
  const boardDiv = document.getElementById('board');
  const statusDiv = document.getElementById('status');
  const resetBtn = document.getElementById('resetBtn');

  function clearWinLine() {
    const line = document.querySelector('.win-line');
    if (line) {
      line.remove();
    }
  }

  function drawWinLine(type, index) {
    clearWinLine();

    const line = document.createElement('div');
    line.className = 'win-line';

    const cellSize = 100;
    const gap = 5;

    if (type === 'row') {
      const topPos = index * (cellSize + gap) + cellSize / 2 - 2.5;
      line.style.width = (cellSize * 3) + (gap * 2) + 'px';
      line.style.height = '5px';
      line.style.top = topPos + 'px';
      line.style.left = '0px';
      line.style.transform = 'none';
    } else if (type === 'col') {
      const leftPos = index * (cellSize + gap) + cellSize / 2 - 2.5;
      line.style.width = '5px';
      line.style.height = (cellSize * 3) + (gap * 2) + 'px';
      line.style.left = leftPos + 'px';
      line.style.top = '0px';
      line.style.transform = 'none';
    } else if (type === 'diag1') {
      line.style.width = Math.sqrt(3 * cellSize * cellSize + 2 * 3 * cellSize * gap + 2 * gap * gap) + 'px';
      line.style.height = '5px';
      line.style.top = '50%';
      line.style.left = '0';
      line.style.transform = 'translateY(-50%) rotate(45deg)';
      line.style.transformOrigin = 'left center';
    } else if (type === 'diag2') {
      line.style.width = Math.sqrt(3 * cellSize * cellSize + 2 * 3 * cellSize * gap + 2 * gap * gap) + 'px';
      line.style.height = '5px';
      line.style.top = '50%';
      line.style.right = '0';
      line.style.left = 'auto';
      line.style.transform = 'translateY(-50%) rotate(-45deg)';
      line.style.transformOrigin = 'right center';
    }

    boardDiv.appendChild(line);
  }

  function initBoard() {
    board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    statusDiv.textContent = '';
    clearWinLine();
  }

  function render() {
    boardDiv.innerHTML = '';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = board[r][c];
        cell.addEventListener('click', () => playerMove(r, c));
        boardDiv.appendChild(cell);
      }
    }
  }

  function isMovesLeft(b) {
    return b.flat().includes('');
  }

  function evaluateWithLine(b) {
    for (let i = 0; i < 3; i++) {
      if (b[i][0] && b[i][0] === b[i][1] && b[i][1] === b[i][2])
        return {score: b[i][0] === AI ? 10 : -10, type: 'row', index: i};
      if (b[0][i] && b[0][i] === b[1][i] && b[1][i] === b[2][i])
        return {score: b[0][i] === AI ? 10 : -10, type: 'col', index: i};
    }
    if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2])
      return {score: b[0][0] === AI ? 10 : -10, type: 'diag1', index: null};
    if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0])
      return {score: b[0][2] === AI ? 10 : -10, type: 'diag2', index: null};
    return null;
  }

  function minimax(b, depth, isMax) {
    const evalObj = evaluateWithLine(b);
    if (evalObj) {
      if (evalObj.score === 10) return evalObj.score - depth;
      else if (evalObj.score === -10) return evalObj.score + depth;
    }
    if (!isMovesLeft(b)) return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          if (b[i][j] === '') {
            b[i][j] = AI;
            best = Math.max(best, minimax(b, depth + 1, false));
            b[i][j] = '';
          }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          if (b[i][j] === '') {
            b[i][j] = HUMAN;
            best = Math.min(best, minimax(b, depth + 1, true));
            b[i][j] = '';
          }
      return best;
    }
  }

  function findBestMove() {
    let bestVal = -Infinity;
    let bestMove = { row: -1, col: -1 };
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[i][j] === '') {
          board[i][j] = AI;
          let moveVal = minimax(board, 0, false);
          board[i][j] = '';
          if (moveVal > bestVal) {
            bestVal = moveVal;
            bestMove = { row: i, col: j };
          }
        }
    return bestMove;
  }

  function gameOverActions(evalResult) {
    if (!evalResult) return false;
    if (evalResult.score === 10) {
      drawWinLine(evalResult.type, evalResult.index);
      statusDiv.textContent = "AI wins!";
      return true;
    } else if (evalResult.score === -10) {
      drawWinLine(evalResult.type, evalResult.index);
      statusDiv.textContent = "You win!";
      return true;
    }
    return false;
  }

  function playerMove(r, c) {
    if (board[r][c] !== '' || !isMovesLeft(board) || statusDiv.textContent) return;
    board[r][c] = HUMAN;
    render();

    let evalResult = evaluateWithLine(board);
    if (gameOverActions(evalResult)) return;

    if (!isMovesLeft(board)) {
      statusDiv.textContent = "It's a draw!";
      return;
    }

    setTimeout(() => {
      let { row, col } = findBestMove();
      board[row][col] = AI;
      render();

      let evalResult = evaluateWithLine(board);
      if (gameOverActions(evalResult)) return;

      if (!isMovesLeft(board)) {
        statusDiv.textContent = "It's a draw!";
      }
    }, 300);
  }

  resetBtn.addEventListener('click', () => {
    initBoard();
    render();
    statusDiv.textContent = '';
    clearWinLine();
  });

  initBoard();
  render();
