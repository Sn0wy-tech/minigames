class GuessGame {
    constructor() {
        this.targetNumber = 0;
        this.attemptsLeft = 0;
        this.isGameOver = false;
        this.config = {
            min: 1,
            max: 100,
            maxAttempts: 7
        };
        
        this.inputEl = document.getElementById("guessInput");
        this.buttonEl = document.getElementById("guessBtn");
        this.restartBtnEl = document.getElementById("restartBtn");
        this.attemptsEl = document.getElementById("attempts");
        this.messageEl = document.getElementById("message");
        this.controlsEl = document.getElementById("controls");
        
        this.buttonEl.addEventListener("click", () => this.checkGuess());
        this.restartBtnEl.addEventListener("click", () => this.resetGame());
        this.inputEl.addEventListener("keydown", (e) => {
            if (e.code === "Enter") this.checkGuess();
        });
        
        this.resetGame();
    }

    resetGame() {
        this.targetNumber = Math.floor(Math.random() * (this.config.max - this.config.min + 1)) + this.config.min;
        this.attemptsLeft = this.config.maxAttempts;
        this.isGameOver = false;
        this.attemptsEl.innerText = this.attemptsLeft.toString();
        this.messageEl.innerText = "Удачи!";
        this.messageEl.className = "text-info";
        this.inputEl.value = "";
        this.controlsEl.style.display = "flex";
        this.restartBtnEl.style.display = "none";
        setTimeout(() => this.inputEl.focus(), 50);
    }

    checkGuess() {
        if (this.isGameOver) return;
        const userValue = parseInt(this.inputEl.value);
        if (isNaN(userValue) || userValue < this.config.min || userValue > this.config.max) {
            this.showMessage(`Введите корректное число от ${this.config.min} до ${this.config.max}!`, "text-danger");
            return;
        }
        this.attemptsLeft--;
        this.attemptsEl.innerText = this.attemptsLeft.toString();
        if (userValue === this.targetNumber) {
            this.endGame(true);
        } else if (this.attemptsLeft === 0) {
            this.endGame(false);
        } else {
            if (userValue < this.targetNumber) {
                this.showMessage(`Загаданное число БОЛЬШЕ, чем ${userValue}`, "text-info");
            } else {
                this.showMessage(`Загаданное число МЕНЬШЕ, чем ${userValue}`, "text-info");
            }
            this.inputEl.value = "";
            this.inputEl.focus();
        }
    }

    showMessage(text, className) {
        this.messageEl.innerText = text;
        this.messageEl.className = className;
    }

    endGame(isWin) {
        this.isGameOver = true;
        this.controlsEl.style.display = "none";
        this.restartBtnEl.style.display = "block";
        if (isWin) {
            this.showMessage(`🎉 Поздравляем! Вы угадали число ${this.targetNumber}!`, "text-success");
        } else {
            this.showMessage(`💥 Игра окончена! Вы проиграли. Было загадано число ${this.targetNumber}.`, "text-danger");
        }
        this.restartBtnEl.focus();
    }
}

// Запуск игры после полной загрузки DOM структуры
document.addEventListener("DOMContentLoaded", () => {
    new GuessGame();
});