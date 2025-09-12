const gameContainer = document.getElementById("game-container");
const resetBtn = document.getElementById("reset");
const difficultySelect = document.getElementById("difficulty");
const mineCounter = document.getElementById("mine-counter");
const timerEl = document.getElementById("timer");

let rows, cols, mines, board, revealedCount, flags, timer, timeElapsed;

// Difficulty settings
const difficulties = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

function startGame() {
  const diff = difficulties[difficultySelect.value];
  rows = diff.rows;
  cols = diff.cols;
  mines = diff.mines;
  revealedCount = 0;
  flags = 0;
  timeElapsed = 0;
  clearInterval(timer);
  timer = null;
  timerEl.textContent = "Time: 0";

  gameContainer.innerHTML = "";
  board = generateBoard(rows, cols, mines);
  renderBoard();
  updateMineCounter();
}

function generateBoard(r, c, mineCount) {
  const board = Array.from({ length: r }, () =>
    Array.from({ length: c }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0
    }))
  );

  // Place mines
  let placed = 0;
  while (placed < mineCount) {
    const x = Math.floor(Math.random() * r);
    const y = Math.floor(Math.random() * c);
    if (!board[x][y].mine) {
      board[x][y].mine = true;
      placed++;
    }
  }

  // Count adjacent
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      if (board[i][j].mine) continue;
      let count = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const ni = i + dx, nj = j + dy;
          if (ni >= 0 && ni < r && nj >= 0 && nj < c && board[ni][nj].mine) {
            count++;
          }
        }
      }
      board[i][j].adjacent = count;
    }
  }

  return board;
}

function renderBoard() {
  gameContainer.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    for (let j = 0; j < cols; j++) {
      const cellDiv = document.createElement("div");
      cellDiv.className = "cell hidden";
      cellDiv.dataset.row = i;
      cellDiv.dataset.col = j;
      cellDiv.addEventListener("click", handleClick);
      cellDiv.addEventListener("contextmenu", handleRightClick);
      rowDiv.appendChild(cellDiv);
    }
    gameContainer.appendChild(rowDiv);
  }
}

function handleClick(e) {
  const r = +e.target.dataset.row;
  const c = +e.target.dataset.col;

  if (!timer) {
    timer = setInterval(() => {
      timeElapsed++;
      timerEl.textContent = `Time: ${timeElapsed}`;
    }, 1000);
  }

  revealCell(r, c);
}

function handleRightClick(e) {
  e.preventDefault();
  const r = +e.target.dataset.row;
  const c = +e.target.dataset.col;
  const cell = board[r][c];

  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  e.target.classList.toggle("flag", cell.flagged);
  e.target.textContent = cell.flagged ? "🚩" : "";
  flags += cell.flagged ? 1 : -1;
  updateMineCounter();
}

function revealCell(r, c) {
  const cell = board[r][c];
  const el = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  el.classList.remove("hidden");
  el.classList.add("revealed");

  if (cell.mine) {
    el.textContent = "💣";
    endGame(false);
    return;
  }

  revealedCount++;
  if (cell.adjacent > 0) {
    el.textContent = cell.adjacent;
  } else {
    // flood fill
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const ni = r + dx, nj = c + dy;
        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
          revealCell(ni, nj);
        }
      }
    }
  }

  if (revealedCount === rows * cols - mines) {
    endGame(true);
  }
}

function endGame(won) {
  clearInterval(timer);
  document.querySelectorAll(".cell").forEach((cellEl) => {
    const r = +cellEl.dataset.row;
    const c = +cellEl.dataset.col;
    const cell = board[r][c];
    if (cell.mine) {
      cellEl.textContent = "💣";
    }
  });
  resetBtn.textContent = won ? "😎" : "💀";
}

function updateMineCounter() {
  mineCounter.textContent = `Mines: ${mines - flags}`;
}

resetBtn.addEventListener("click", () => {
  resetBtn.textContent = "🙂";
  startGame();
});

difficultySelect.addEventListener("change", startGame);

startGame();
