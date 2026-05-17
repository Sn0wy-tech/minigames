class TicTacToe {
    constructor() {
        this.board = Array(9).fill("");
        this.isGameActive = true;
        this.humanPlayer = "X";
        this.botPlayer = "O";
        this.scores = { player: 0, bot: 0 };

        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Строки
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Столбцы
            [0, 4, 8], [2, 4, 6]             // Диагонали
        ];

        this.cells = document.querySelectorAll(".cell");
        this.statusField = document.getElementById("statusField");
        this.resetBtn = document.getElementById("resetBtn");
        this.scorePlayerEl = document.getElementById("scorePlayer");
        this.scoreBotEl = document.getElementById("scoreBot");

        this.initEvents();
    }

    initEvents() {
        this.cells.forEach(cell => {
            cell.addEventListener("click", (e) => this.handleCellClick(e.target));
        });
        this.resetBtn.addEventListener("click", () => this.restartGame());
    }

    handleCellClick(clickedCell) {
        const index = parseInt(clickedCell.getAttribute("data-index"));

        if (this.board[index] !== "" || !this.isGameActive) {
            return;
        }

        this.makeMove(index, this.humanPlayer);

        if (this.checkResult(this.humanPlayer)) {
            this.endGame("player");
            return;
        }

        if (this.board.every(cell => cell !== "")) {
            this.endGame("draw");
            return;
        }

        this.isGameActive = false;
        this.statusField.innerText = "Ход бота...";
        
        setTimeout(() => this.makeBotMove(), 400);
    }

    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].innerText = player;
        this.cells[index].classList.add(player.toLowerCase());
    }

    makeBotMove() {
        if (!this.board.includes("")) return;

        // 1. Проверяем, может ли бот выиграть этим ходом
        let move = this.findStrategicMove(this.botPlayer);
        
        // 2. Если нет, проверяем, нужно ли заблокировать игрока
        if (move === null) {
            move = this.findStrategicMove(this.humanPlayer);
        }

        // 3. Занимаем центр, если он свободен
        if (move === null && this.board[4] === "") {
            move = 4;
        }

        // 4. Иначе берем случайную свободную ячейку
        if (move === null) {
            const availableIndices = this.board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
            move = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        }

        this.makeMove(move, this.botPlayer);

        if (this.checkResult(this.botPlayer)) {
            this.endGame("bot");
            return;
        }

        if (this.board.every(cell => cell !== "")) {
            this.endGame("draw");
            return;
        }

        this.isGameActive = true;
        this.statusField.innerText = "Ваш ход!";
    }

    findStrategicMove(player) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            const values = [this.board[a], this.board[b], this.board[c]];
            const playerCount = values.filter(v => v === player).length;
            const emptyCount = values.filter(v => v === "").length;

            if (playerCount === 2 && emptyCount === 1) {
                if (this.board[a] === "") return a;
                if (this.board[b] === "") return b;
                if (this.board[c] === "") return c;
            }
        }
        return null;
    }

    checkResult(player) {
        return this.winningConditions.some(condition => {
            return condition.every(index => this.board[index] === player);
        });
    }

    endGame(winner) {
        this.isGameActive = false;
        if (winner === "player") {
            this.statusField.innerText = "🎉 Вы победили!";
            this.scores.player++;
            this.scorePlayerEl.innerText = this.scores.player;
        } else if (winner === "bot") {
            this.statusField.innerText = "🤖 Бот победил!";
            this.scores.bot++;
            this.scoreBotEl.innerText = this.scores.bot;
        } else {
            this.statusField.innerText = "🤝 Ничья!";
        }
    }

    restartGame() {
        this.board = Array(9).fill("");
        this.isGameActive = true;
        this.statusField.innerText = "Ваш ход!";
        this.cells.forEach(cell => {
            cell.innerText = "";
            cell.className = "cell";
        });
    }
}

// Запуск логики строго после полной инициализации DOM-структуры
document.addEventListener("DOMContentLoaded", () => {
    new TicTacToe();
});
