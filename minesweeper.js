const container = document.getElementById("game-container");
const resetBtn = document.getElementById("reset");
const diffSelect = document.getElementById("difficulty");

let rows, cols, mines;
let board = [];
let gameOver = false;

// Difficulty presets
const presets = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

// Start game
function startGame() {
  const diff = diffSelect.value;
  rows = presets[diff].rows;
  cols = presets[diff].cols;
  mines = presets[diff].mines;
  gameOver = false;
  board = [];

  container.innerHTML = "";

  // Build empty board
  for (let r = 0; r < rows; r++) {
    const rowEl = document.createElement("div");
    rowEl.classList.add("row");
    const row = [];
    for (let c = 0; c < cols; c++) {
      const cell = {
        row: r,
        col: c,
        mine: false,
        revealed: false,
        flagged: false,
        neighbor: 0,
        el: document.createElement("div")
      };
      cell.el.classList.add("cell", "hidden");
      cell.el.addEventListener("click", () => handleClick(cell));
      cell.el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(cell);
      });
      rowEl.appendChild(cell.el);
      row.push(cell);
    }
    container.appendChild(rowEl);
    board.push(row);
  }

  // Place mines
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine) {
        board[r][c].neighbor = countNeighbors(r, c);
      }
    }
  }
}

// Count surrounding mines
function countNeighbors(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc].mine) count++;
    }
  }
  return count;
}

function inBounds(r, c) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

// Handle left click
function handleClick(cell) {
  if (gameOver || cell.flagged) return;

  // Chording: click revealed number with correct flags
  if (cell.revealed && cell.neighbor > 0) {
    const flagged = countFlagsAround(cell.row, cell.col);
    if (flagged === cell.neighbor) {
      revealNeighbors(cell.row, cell.col);
    }
    return;
  }

  if (cell.mine) {
    cell.el.classList.add("mine");
    gameOver = true;
    revealAll();
    alert("💥 Game over!");
  } else {
    revealCell(cell);
    checkWin();
  }
}

function revealCell(cell) {
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  cell.el.classList.remove("hidden");
  cell.el.classList.add("revealed");

  if (cell.neighbor > 0) {
    cell.el.textContent = cell.neighbor;
  } else {
    // flood fill
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = cell.row + dr, nc = cell.col + dc;
        if (inBounds(nr, nc)) revealCell(board[nr][nc]);
      }
    }
  }
}

function toggleFlag(cell) {
  if (gameOver || cell.revealed) return;
  cell.flagged = !cell.flagged;
  if (cell.flagged) {
    cell.el.textContent = "🚩";
    cell.el.classList.add("flag");
  } else {
    cell.el.textContent = "";
    cell.el.classList.remove("flag");
  }
}

function countFlagsAround(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc].flagged) count++;
    }
  }
  return count;
}

function revealNeighbors(r, c) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc)) handleClick(board[nr][nc]);
    }
  }
}

function revealAll() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell.mine) {
        cell.el.textContent = "💣";
        cell.el.classList.add("mine");
      } else if (!cell.revealed) {
        revealCell(cell);
      }
    }
  }
}

function checkWin() {
  let hidden = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].revealed && !board[r][c].mine) hidden++;
    }
  }
  if (hidden === 0) {
    gameOver = true;
    alert("🎉 You win!");
  }
}

// Reset and difficulty
resetBtn.addEventListener("click", startGame);
diffSelect.addEventListener("change", startGame);

startGame();
