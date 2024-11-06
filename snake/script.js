const gridSize = 20;
const gameContainer = document.getElementById('gameContainer');
let snake = [{ x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }]; // Start with 4 grid spaces
let direction = 'RIGHT'; // Initial direction
let food = {};
let gameInterval;
let gameOver = false; // Flag to track if the game is over

function createGrid() {
    gameContainer.innerHTML = ''; // Clear the grid
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            gameContainer.appendChild(cell);
        }
    }
}

function drawSnake() {
    const cells = gameContainer.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('snake')); // Clear previous snake positions
    snake.forEach(segment => {
        const index = segment.y * gridSize + segment.x;
        cells[index].classList.add('snake');
    });
}

function drawFood() {
    const cells = gameContainer.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('food')); // Clear previous food
    const foodIndex = food.y * gridSize + food.x;
    cells[foodIndex].classList.add('food');
}

function generateFood() {
    let x = Math.floor(Math.random() * gridSize);
    let y = Math.floor(Math.random() * gridSize);
    
    // Ensure the food doesn't appear on the snake
    while (snake.some(segment => segment.x === x && segment.y === y)) {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
    }

    food = { x, y };
    drawFood();
}

function moveSnake() {
    const head = { ...snake[0] };

    switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
    }

    // If snake runs into walls or itself, game over
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver = true;  // Set game over flag
        clearInterval(gameInterval);
        alert('Game Over! Press Space to Restart.');
        return;
    }

    snake.unshift(head); // Add the new head to the snake

    // Check if the snake eats food
    if (head.x === food.x && head.y === food.y) {
        generateFood(); // Generate new food
    } else {
        snake.pop(); // Remove the last segment of the snake if no food eaten
    }

    drawSnake();
}

function changeDirection(event) {
    // Prevent the snake from going in the opposite direction
    if (event.key === 'ArrowUp' && direction !== 'DOWN') {
        direction = 'UP';
    } else if (event.key === 'ArrowDown' && direction !== 'UP') {
        direction = 'DOWN';
    } else if (event.key === 'ArrowLeft' && direction !== 'RIGHT') {
        direction = 'LEFT';
    } else if (event.key === 'ArrowRight' && direction !== 'LEFT') {
        direction = 'RIGHT';
    }
}

function startGame() {
    snake = [{ x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }];
    direction = 'RIGHT';
    gameOver = false;
    createGrid();
    generateFood();
    drawSnake();

    // Start moving the snake every 200ms
    gameInterval = setInterval(moveSnake, 200);
}

// Function to restart the game when spacebar is pressed
function restartGame(event) {
    if (event.key === ' ') {  // Spacebar pressed
        if (gameOver) {
            startGame(); // Restart the game
        }
    }
}

// Listen for arrow key presses to change direction
window.addEventListener('keydown', changeDirection);

// Listen for spacebar to restart the game
window.addEventListener('keydown', restartGame);

// Start the game when the first arrow key is pressed
window.addEventListener('keydown', () => {
    if (!gameInterval && !gameOver) {
        startGame();
    }
});
