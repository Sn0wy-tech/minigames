class SnakeGame {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.restartBtn = document.getElementById("restartBtn");
        this.scoreEl = document.getElementById("currentScore");
        this.highScoreEl = document.getElementById("highScore");

        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.dx = this.gridSize;
        this.dy = 0;
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem("snakeHighScore")) || 0;
        this.highScoreEl.innerText = this.highScore;

        this.gameInterval = null;
        this.gameSpeed = 120; // Lower is faster
        this.isGameOver = false;

        this.initEvents();
        this.resetGame();
    }

    initEvents() {
        document.addEventListener("keydown", (e) => this.handleDirectionChange(e));
        this.restartBtn.addEventListener("click", () => this.resetGame());
    }

    resetGame() {
        this.snake = [
            { x: 5 * this.gridSize, y: 10 * this.gridSize },
            { x: 4 * this.gridSize, y: 10 * this.gridSize },
            { x: 3 * this.gridSize, y: 10 * this.gridSize }
        ];
        
        this.dx = this.gridSize;
        this.dy = 0;
        this.score = 0;
        this.scoreEl.innerText = this.score;
        this.gameSpeed = 120;
        this.isGameOver = false;
        this.restartBtn.style.display = "none";

        this.spawnFood();
        
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.startGameLoop();
    }

    startGameLoop() {
        this.gameInterval = setInterval(() => {
            this.update();
            this.draw();
        }, this.gameSpeed);
    }

    update() {
        if (this.isGameOver) return;

        // Move the head forward
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Self-collision validation
        if (this.checkSelfCollision(head)) {
            this.endGame();
            return;
        }

        // Screen boundaries cross-over loop (Pacman style wrap-around)
        if (head.x < 0) head.x = this.canvas.width - this.gridSize;
        if (head.x >= this.canvas.width) head.x = 0;
        if (head.y < 0) head.y = this.canvas.height - this.gridSize;
        if (head.y >= this.canvas.height) head.y = 0;

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreEl.innerText = this.score;
            this.spawnFood();
            this.increaseSpeed();
        } else {
            this.snake.pop(); // Remove tail if no food eaten
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = "#1a1a1a";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw food
        this.ctx.fillStyle = "#dc3545";
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#dc3545";
        this.ctx.fillRect(this.food.x + 1, this.food.y + 1, this.gridSize - 2, this.gridSize - 2);

        // Draw Snake
        this.ctx.shadowBlur = 0; // Reset shadows for performance
        this.snake.forEach((part, index) => {
            const isHead = index === 0;
            this.ctx.fillStyle = isHead ? "#28a745" : "#45c468";
            this.ctx.fillRect(part.x + 1, part.y + 1, this.gridSize - 2, this.gridSize - 2);
        });

        // Overlay Game Over Text
        if (this.isGameOver) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 24px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("ИГРА ОКОНЧЕНА", this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    handleDirectionChange(e) {
        const key = e.key.toLowerCase();
        const goingUp = this.dy === -this.gridSize;
        const goingDown = this.dy === this.gridSize;
        const goingRight = this.dx === this.gridSize;
        const goingLeft = this.dx === -this.gridSize;

        // Support arrow keys + WASD, prevent 180-degree self-bites
        if ((key === "arrowleft" || key === "a") && !goingRight) {
            this.dx = -this.gridSize;
            this.dy = 0;
        }
        if ((key === "arrowup" || key === "w") && !goingDown) {
            this.dx = 0;
            this.dy = -this.gridSize;
        }
        if ((key === "arrowright" || key === "d") && !goingLeft) {
            this.dx = this.gridSize;
            this.dy = 0;
        }
        if ((key === "arrowdown" || key === "s") && !goingUp) {
            this.dx = 0;
            this.dy = this.gridSize;
        }
    }

    spawnFood() {
        let validLocation = false;
        while (!validLocation) {
            this.food.x = Math.floor(Math.random() * this.tileCount) * this.gridSize;
            this.food.y = Math.floor(Math.random() * this.tileCount) * this.gridSize;
            
            // Ensure food doesn't spawn inside the snake body
            validLocation = !this.snake.some(part => part.x === this.food.x && part.y === this.food.y);
        }
    }

    checkSelfCollision(head) {
        return this.snake.some(part => part.x === head.x && part.y === head.y);
    }

    increaseSpeed() {
        if (this.gameSpeed > 50) {
            this.gameSpeed -= 3; // Make loop run slightly faster
            clearInterval(this.gameInterval);
            this.startGameLoop();
        }
    }

    endGame() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        this.restartBtn.style.display = "block";

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreEl.innerText = this.highScore;
            localStorage.setItem("snakeHighScore", this.highScore.toString());
        }
        this.draw(); // Redraw once to show overlays immediately
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new SnakeGame();
});
