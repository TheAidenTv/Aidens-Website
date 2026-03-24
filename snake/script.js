const GRID_SIZE = 20;
const START_LENGTH = 4;
const TICK_RATE_MS = 160;

const DIRECTION_VECTORS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

const OPPOSITE_DIRECTIONS = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT"
};

const gameContainer = document.getElementById("gameContainer");
const scoreElement = document.getElementById("score");
const statusElement = document.getElementById("game-status");
const statusMessageElement = document.getElementById("statusMessage");
const restartButton = document.getElementById("restartButton");
const restartLabel = document.getElementById("restartLabel");
const controlButtons = document.querySelectorAll("[data-direction]");

let cells = [];
let snake = [];
let food = null;
let currentDirection = "RIGHT";
let directionQueue = [];
let gameIntervalId = null;
let gameState = "idle";
let statusLabel = "Ready";
let statusMessage = "Press any direction to start.";
let score = 0;
let touchStart = null;

function createGrid() {
    if (cells.length > 0) {
        return;
    }

    for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
        const cell = document.createElement("div");
        cell.className = "cell";
        gameContainer.appendChild(cell);
        cells.push(cell);
    }
}

function buildStartingSnake(initialDirection = "RIGHT") {
    const head = {
        x: Math.floor(GRID_SIZE / 2),
        y: Math.floor(GRID_SIZE / 2)
    };
    const tailVector = DIRECTION_VECTORS[OPPOSITE_DIRECTIONS[initialDirection]];
    const startingSnake = [head];

    for (let index = 1; index < START_LENGTH; index += 1) {
        startingSnake.push({
            x: head.x + (tailVector.x * index),
            y: head.y + (tailVector.y * index)
        });
    }

    return startingSnake;
}

function getCellIndex(position) {
    return (position.y * GRID_SIZE) + position.x;
}

function syncUi() {
    scoreElement.textContent = String(score);
    statusElement.dataset.state = gameState;
    statusElement.textContent = statusLabel;
    statusMessageElement.textContent = statusMessage;

    if (gameState === "idle") {
        restartLabel.textContent = "Start Game";
    } else if (gameState === "running") {
        restartLabel.textContent = "Restart Game";
    } else {
        restartLabel.textContent = "Play Again";
    }
}

function setGameState(nextState, nextMessage, nextLabel) {
    gameState = nextState;
    statusMessage = nextMessage;
    statusLabel = nextLabel;
    syncUi();
}

function renderBoard() {
    cells.forEach((cell) => {
        cell.className = "cell";
    });

    snake.forEach((segment, index) => {
        const cell = cells[getCellIndex(segment)];

        if (!cell) {
            return;
        }

        cell.classList.add("snake");

        if (index === 0) {
            cell.classList.add("snake-head");
        }
    });

    if (food) {
        const foodCell = cells[getCellIndex(food)];

        if (foodCell) {
            foodCell.classList.add("food");
        }
    }

    gameContainer.classList.toggle("is-game-over", gameState === "over");
}

function stopGameLoop() {
    if (gameIntervalId !== null) {
        window.clearInterval(gameIntervalId);
        gameIntervalId = null;
    }
}

function generateFood() {
    const openCells = [];

    for (let y = 0; y < GRID_SIZE; y += 1) {
        for (let x = 0; x < GRID_SIZE; x += 1) {
            const isSnakeCell = snake.some((segment) => segment.x === x && segment.y === y);

            if (!isSnakeCell) {
                openCells.push({ x, y });
            }
        }
    }

    if (openCells.length === 0) {
        return null;
    }

    return openCells[Math.floor(Math.random() * openCells.length)];
}

function finishGame(message, label = "Game Over") {
    stopGameLoop();
    setGameState("over", message, label);
    renderBoard();
}

function startGame(initialDirection = "RIGHT") {
    stopGameLoop();
    snake = buildStartingSnake(initialDirection);
    currentDirection = initialDirection;
    directionQueue = [];
    score = 0;
    food = generateFood();

    setGameState("running", "Swipe, tap, or use arrow keys.", "Live");
    renderBoard();
    gameIntervalId = window.setInterval(tick, TICK_RATE_MS);
}

function resetPreview() {
    stopGameLoop();
    snake = buildStartingSnake();
    currentDirection = "RIGHT";
    directionQueue = [];
    score = 0;
    food = generateFood();

    setGameState("idle", "Press any direction to start.", "Ready");
    renderBoard();
}

function tick() {
    if (directionQueue.length > 0) {
        currentDirection = directionQueue.shift();
    }

    const vector = DIRECTION_VECTORS[currentDirection];
    const head = snake[0];
    const nextHead = {
        x: head.x + vector.x,
        y: head.y + vector.y
    };

    const hitsWall = nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE;
    const isEatingFood = food && nextHead.x === food.x && nextHead.y === food.y;
    const collisionTargets = isEatingFood ? snake : snake.slice(0, -1);
    const hitsSelf = collisionTargets.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

    if (hitsWall || hitsSelf) {
        finishGame("Press Play Again or Space.", "Game Over");
        return;
    }

    snake.unshift(nextHead);

    if (isEatingFood) {
        score += 1;
        food = generateFood();

        if (!food) {
            finishGame("Board cleared. Play again?", "You Win");
            return;
        }
    } else {
        snake.pop();
    }

    syncUi();
    renderBoard();
}

function queueDirection(nextDirection) {
    if (!(nextDirection in DIRECTION_VECTORS)) {
        return;
    }

    if (gameState === "over") {
        return;
    }

    if (gameState === "idle") {
        startGame(nextDirection);
        return;
    }

    const lastQueuedDirection = directionQueue[directionQueue.length - 1] || currentDirection;

    if (nextDirection === lastQueuedDirection || nextDirection === OPPOSITE_DIRECTIONS[lastQueuedDirection]) {
        return;
    }

    directionQueue.push(nextDirection);
}

function handleKeydown(event) {
    const directionKeys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        W: "UP",
        s: "DOWN",
        S: "DOWN",
        a: "LEFT",
        A: "LEFT",
        d: "RIGHT",
        D: "RIGHT"
    };

    if (event.code === "Space") {
        event.preventDefault();
        startGame();
        return;
    }

    const nextDirection = directionKeys[event.key];

    if (nextDirection) {
        event.preventDefault();
        queueDirection(nextDirection);
    }
}

function handleTouchStart(event) {
    const touch = event.changedTouches[0];

    touchStart = {
        x: touch.clientX,
        y: touch.clientY
    };
}

function handleTouchEnd(event) {
    if (!touchStart) {
        return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    touchStart = null;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) {
        return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        queueDirection(deltaX > 0 ? "RIGHT" : "LEFT");
        return;
    }

    queueDirection(deltaY > 0 ? "DOWN" : "UP");
}

createGrid();
resetPreview();

document.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", () => {
    startGame();
});

controlButtons.forEach((button) => {
    button.addEventListener("click", () => {
        queueDirection(button.dataset.direction);
    });
});

gameContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
gameContainer.addEventListener("touchend", handleTouchEnd, { passive: true });
