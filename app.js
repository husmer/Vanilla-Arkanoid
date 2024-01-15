// +++ Setting game constants +++
const boardWidth = 670;
const boardHeight = 300;

const blockWidth = 100;
const blockHeight = 20;

const ballWidth = 10;
const ballHeight = 10;
const ballSpeed = 5;



let xDirection = -2;
let yDirection = 2;

const nmbOfColumns = 6;
const nmbOfRows = 3;

// Setting the max score of the game
const maxScore = 10 * nmbOfColumns * nmbOfRows;
let gameIsOver = false;

const grid = document.querySelector('.grid');



const bat = new Block(280, 10, blockWidth, blockHeight);
displayBlock(bat, 'bat');

const ball = new Block(280, 50, ballWidth, ballHeight);
displayBlock(ball, 'ball');

const scoreSpan = document.getElementById('score');
const gameover = document.getElementById('gameover');
let score = 0;

// Start/Reset button
const toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', toggleGame);

let isGameRunning = false;

// Define block prototype
function Block(left, bottom, width, height) {
    this.bottomLeft = { x: left, y: bottom };
    this.bottomRight = { x: left + width, y: bottom };
    this.topLeft = { x: left, y: bottom + height };
    this.topRight = { x: left + width, y: bottom + height };
    this.width = width;
    this.height = height;
}

Block.prototype.setX = function(x) {
    this.bottomLeft.x = x;
    this.bottomRight.x = x + this.width;
    this.topRight.x = x + this.width;
    this.topLeft.x = x;
}

Block.prototype.setY = function(y) {
    this.bottomLeft.y = y;
    this.topLeft.y = y + this.height;
    this.bottomRight.y = y;
    this.topRight.y = y + this.height;
}

Block.prototype.setPosition = function(x, y) {
    this.setX(x);
    this.setY(y);
}

let blocks = [];

// --- End of setting game constants ---

// +++ Building game blocks +++
createRows();
displayBlocks();

function displayBlocks() {
    blocks.forEach(b => displayBlock(b, 'block'));
}

function displayBlock(b, style) {
    const block = document.createElement('div');
        block.classList.add(style);
        block.style.left = b.bottomLeft.x + 'px';
        block.style.bottom = b.bottomLeft.y + 'px';
        grid.appendChild(block);
}

function createRows() {
    let blockCounter = 0;
    for (let j = 0; j < nmbOfRows; j++) {
        for (let i = 0; i < nmbOfColumns; i++) {
            const block = new Block(10 + i * (blockWidth + 10), 300 - (j+1) * (20 + 10), blockWidth, blockHeight);
            blocks.push(block);
            blockCounter += 1
        }
    };

    return blockCounter;
}
// --- End of building game blocks ---

// +++ Start of define game loop +++
function moveBat(event) {
    const key = event.key;
    switch (key) {
        case 'ArrowLeft':
            if (bat.bottomLeft.x >= 10) {
                bat.setX(bat.bottomLeft.x - 10);
                const bElement = document.querySelector('.bat');
                bElement.style.left = bat.bottomLeft.x + 'px';
            }
            break;
        case 'ArrowRight':
            if (bat.bottomLeft.x <= 560) {
                bat.setX(bat.bottomLeft.x + 10);
                const bElement = document.querySelector('.bat');
                bElement.style.left = bat.bottomLeft.x + 'px';
            }
            break;
    }
}

function moveBall() {
    if (gameIsOver) {
        return;
    }
    checkCollision();
    scoreSpan.innerHTML = score;
    if (score === maxScore) {
        gameover.innerHTML = " WINNER WINNER CHICKEN DINNER!";
        stop();
    }
    ball.setX(ball.bottomLeft.x + xDirection);
    ball.setY(ball.bottomLeft.y + yDirection);
    const ballElement = document.querySelector('.ball');
    ballElement.style.left = ball.bottomLeft.x + 'px';
    ballElement.style.bottom = ball.bottomLeft.y + 'px';
}


function checkCollision() {
    // Bat hit detection
    if (ball.bottomRight.x >= bat.topLeft.x && ball.bottomLeft.x <= bat.topRight.x && ball.bottomRight.y === bat.topRight.y) {
        yDirection = -1 * yDirection;
        if (ball.bottomLeft.x - bat.topLeft.x < (blockWidth / 2)) {         // if we hit the bat on the right half it should bounce off to the right otherwise to the left
            xDirection = -2;
        } else {
            xDirection = 2;
        }
    }
    // Wall hit detection
    if (ball.topRight.x === boardWidth || ball.topLeft.x === 0) {    // Left or Right wall
        xDirection = -1 * xDirection;
    }
    // Top wall hit detection
    if (ball.topRight.y === boardHeight) {    
        yDirection = -1 * yDirection;
        if (xDirection === 2) {
            xDirection = 1;
        } else {
            xDirection = -1;
        }
    } 
    // Bottom wall hit detection
    if (ball.bottomRight.y === 0) {    
        gameover.innerHTML = " Game over bozo...";
        stop();
    }
     // Block hit detection
    const blkIndex = blocks.findIndex(checkBounds);
    // Check if no blocks are touched
    if (blkIndex < 0) {
        return
    }

    if (hitSide(blocks[blkIndex])) {
        xDirection = -1 * xDirection; // Blocks side wall hit reverses x direction
        removeBlock(blkIndex);
        return
    }
    
    if (hitDirect(blocks[blkIndex])) {
        yDirection = -1 * yDirection; // Direct hit reverses y direction
        removeBlock(blkIndex);
        return
    }

}

function removeBlock(removeableBlockIndex) {
    const allBlocks = document.querySelectorAll('.block');
    grid.removeChild(allBlocks[removeableBlockIndex]);
    blocks.splice(removeableBlockIndex, 1);
    score = score + 10;
}

function checkBounds(b) {
    if (
        ball.bottomRight.x < b.bottomLeft.x || // Ball is to the left of b
        ball.bottomLeft.x > b.bottomRight.x || // Ball is to the right of b
        ball.bottomRight.y > b.topRight.y ||   // Ball is above b
        ball.topRight.y < b.bottomRight.y) {    // ball is below b
        return false; // No collision
    }
    return true; // Collision detected
}
function hitSide(b) {
    if (ball.bottomLeft.y >= b.bottomRight.y && 
        ball.bottomLeft.y <= b.topRight.y &&
        ball.bottomLeft.x === b.topRight.x) {
        return true;
    }
    if (ball.bottomRight.y >= b.bottomLeft.y && 
        ball.bottomRight.y <= b.topLeft.y &&
        ball.bottomRight.x === b.topLeft.y) {
        return true;
    }
    return false;
}

function hitDirect(b) {
    if (ball.topRight.x >= b.bottomLeft.x && 
        ball.topLeft.x <= b.bottomRight.x) {
        return true;
    }
}

function stop() {
    document.removeEventListener('keydown', moveBat);
    gameIsOver = true;
}
// +++ Starts the game +++


function gameLoop() {
    if (isGameRunning) {
        moveBall();
        requestAnimationFrame(gameLoop);
    }

}

// +++ Pause, Start, Reset, Continue menu +++
function toggleGame() {
    if(!isGameRunning) {
        // Start Game
        console.log("!!!!! I Was triggered")
        
        isGameRunning = true;
        toggleButton.textContent = 'Reset';
        document.addEventListener('keydown', moveBat);
        // Set correct ball direction
        xDirection = -2;
        yDirection = 2;

        requestAnimationFrame(gameLoop);
    } else {
        // Reset Game
        resetGame();
    }
}

function resetGame() {
    gameover.innerHTML = "";
    document.removeEventListener('keydown', moveBat);

    isGameRunning = false;
    gameIsOver = false;
    toggleButton.textContent = 'Start';

    removeBlockElements("block");
    removeBlockElements("bat");
    removeBlockElements("ball");
    blocks.length = 0;

    createRows();
    displayBlocks();

    // Reset ball and bat positions
    bat.setPosition(280, 10);
    ball.setPosition(280, 50);
    displayBlock(bat, 'bat');
    displayBlock(ball, 'ball');

    xDirection = -2;
    yDirection = 2;

    score = 0;
    console.log("resetGame blocks: " + blocks.length);
}

function removeBlockElements(className) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(element => {
        grid.removeChild(element);
    });
}