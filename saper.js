class Minesweeper {
    constructor() {
        this.rows = 9;
        this.cols = 9;
        this.totalMines = 10;
        
        this.gridEl = document.getElementById("mineGrid");
        this.faceBtn = document.getElementById("faceBtn");
        this.mineCounterEl = document.getElementById("mineCounter");
        this.timerBoxEl = document.getElementById("timerBox");

        this.board = [];
        this.isGameOver = false;
        this.isFirstClick = true;
        this.flagsPlaced = 0;
        
        this.timer = 0;
        this.timerInterval = null;

        this.faceBtn.addEventListener("click", () => this.initGame());
        this.initGame();
    }

    initGame() {
        this.isGameOver = false;
        this.isFirstClick = true;
        this.flagsPlaced = 0;
        this.timer = 0;
        this.faceBtn.innerText = "🙂";
        this.updateMineCounter();
        this.timerBoxEl.innerText = "000";
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.board = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(null).map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );

        this.renderBoard();
    }

    renderBoard() {
        this.gridEl.innerHTML = "";
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cellEl = document.createElement("div");
                cellEl.classList.add("cell");
                cellEl.dataset.row = r;
                cellEl.dataset.col = c;

                // Left click to reveal
                cellEl.addEventListener("click", () => this.handleLeftClick(r, c));
                // Right click to flag
                cellEl.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    this.handleRightClick(r, c);
                });

                this.gridEl.appendChild(cellEl);
            }
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            if (this.timer > 999) this.timer = 999;
            this.timerBoxEl.innerText = String(this.timer).padStart(3, "0");
        }, 1000);
    }

    generateMines(firstR, firstC) {
        let minesPlaced = 0;
        while (minesPlaced < this.totalMines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);

            // Never place a mine on the first clicked cell or its immediate neighbors
            const isSafeZone = Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1;

            if (!this.board[r][c].isMine && !isSafeZone) {
                this.board[r][c].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate surrounding mine counts
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.board[r][c].isMine) {
                    this.board[r][c].neighborMines = this.countNeighborMines(r, c);
                }
            }
        }
    }

    countNeighborMines(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    if (this.board[nr][nc].isMine) count++;
                }
            }
        }
        return count;
    }

    handleLeftClick(r, c) {
        if (this.isGameOver || this.board[r][c].isRevealed || this.board[r][c].isFlagged) return;

        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.generateMines(r, c);
            this.startTimer();
        }

        if (this.board[r][c].isMine) {
            this.revealAllMines(false);
            this.endGame(false);
            return;
        }

        this.revealCell(r, c);
        this.checkWinCondition();
    }

    handleRightClick(r, c) {
        if (this.isGameOver || this.board[r][c].isRevealed) return;

        const cell = this.board[r][c];
        const cellEl = this.getCellDomElement(r, c);

        if (!cell.isFlagged) {
            cell.isFlagged = true;
            this.flagsPlaced++;
            cellEl.innerText = "🚩";
        } else {
            cell.isFlagged = false;
            this.flagsPlaced--;
            cellEl.innerText = "";
        }
        this.updateMineCounter();
    }

    revealCell(r, c) {
        const cell = this.board[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        cell.isRevealed = true;
        const cellEl = this.getCellDomElement(r, c);
        cellEl.classList.add("revealed");
        cellEl.style.border = "1px solid #7b7b7b";

        if (cell.neighborMines > 0) {
            cellEl.innerText = cell.neighborMines;
            cellEl.classList.add(`n-${cell.neighborMines}`);
        } else {
            // Flood fill cascade for empty zones
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                        this.revealCell(nr, nc);
                    }
                }
            }
        }
    }

    revealAllMines(won) {
        clearInterval(this.timerInterval);
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                const cellEl = this.getCellDomElement(r, c);
                if (cell.isMine) {
                    cellEl.classList.add("revealed", "mine");
                    cellEl.style.border = "1px solid #7b7b7b";
                    cellEl.innerText = "💣";
                }
            }
        }
    }

    checkWinCondition() {
        let unrevealedSafeCells = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.board[r][c].isMine && !this.board[r][c].isRevealed) {
                    unrevealedSafeCells++;
                }
            }
        }
        if (unrevealedSafeCells === 0) {
            this.endGame(true);
        }
    }

    endGame(isWin) {
        this.isGameOver = true;
        clearInterval(this.timerInterval);
        if (isWin) {
            this.faceBtn.innerText = "😎";
            // Auto flag remaining unflagged mines for clean win look
            this.mineCounterEl.innerText = "000";
        } else {
            this.faceBtn.innerText = "😵";
        }
    }

    updateMineCounter() {
        const remaining = this.totalMines - this.flagsPlaced;
        this.mineCounterEl.innerText = String(Math.max(0, remaining)).padStart(3, "0");
    }

    getCellDomElement(r, c) {
        return this.gridEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Minesweeper();
});
