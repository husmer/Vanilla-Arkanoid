const boardWidth = 670;
const boardHeight = 300;

const blockWidth = 100;
const blockHeight = 20;

const ballWidth = 10;
const ballHeight = 10;
const ballSpeed = 5;

const maxScore = 180;

let xDirection = -2;
let yDirection = 2;

let gameIsOver = false;

const grid = document.querySelector('.grid');

document.addEventListener('keydown', moveBat);

const bat = new Block(280, 10, blockWidth, blockHeight);
displayBlock(bat, 'bat');

const ball = new Block(280, 50, ballWidth, ballHeight);
displayBlock(ball, 'ball');

const scoreSpan = document.getElementById('score');
const gameover = document.getElementById('gameover');
let score = 0;

const splashScreen = document.getElementById('splashScreen');
const countdownElement = document.getElementById('countdown');

// Show the splash screen initially
splashScreen.style.display = 'flex';

// Countdown and start the game
let countdown = 3;
countdownElement.textContent = countdown;

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

// define blocks
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


const blocks = [];

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
    for (let j = 1; j < 4; j++) {
        for (let i = 0; i < 6; i++) {
            const block = new Block(
                10 + i * (blockWidth + 10), 
                300 - j * (20 + 10), 
                blockWidth, 
                blockHeight
            );
            blocks.push(block);
        }
    }
}

function moveBall(timestamp) {
    if (gameIsOver) {
        return;
    }
    checkCollision();
    scoreSpan.innerHTML = score;
    if (score === maxScore) {
        gameover.innerHTML = " WINNER WINNER CHICKEN DINNER!";
        stop();
    }

    if (!startTime) {
        startTime = timestamp;
    }

    const elapsedMilliseconds = timestamp - startTime;
    if (elapsedMilliseconds >= ballSpeed) {
        ball.setX(ball.bottomLeft.x + xDirection);
        ball.setY(ball.bottomLeft.y + yDirection);
        const ballElement = document.querySelector('.ball');
        ballElement.style.left = ball.bottomLeft.x + 'px';
        ballElement.style.bottom = ball.bottomLeft.y + 'px';
    }

    requestAnimationFrame(moveBall);
}

let startTime;
let countdownInterval;

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
    // Wall and Block hit detection
    if (ball.topRight.x === boardWidth || ball.topLeft.x === 0) {    // Left or Right wall
        xDirection = -1 * xDirection;
    } else if (ball.topRight.y === boardHeight) {    // Top wall
        yDirection = -1 * yDirection;
    } else if (ball.bottomRight.y === 0) {    // Bottom wall
        stop();
    } else {  // Block hit detection
        const blkIndex = blocks.findIndex(checkBounds);
        if (blkIndex >= 0) {
            if (hitSide(blocks[blkIndex])) {
                xDirection = -1 * xDirection; // Blocks side wall hit reverses x direction
            } else {
                yDirection = -1 * yDirection; // Direct hit reverses y direction
            }
            const allBlocks = document.querySelectorAll('.block');
            grid.removeChild(allBlocks[blkIndex]);
            blocks.splice(blkIndex, 1);
            score = score + 10;
        }
    }
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
    if (ball.bottomLeft.y >= b.bottomRight.y && ball.bottomLeft.y <= b.topRight.y) {
        return true;
    }
    if (ball.bottomRight.y >= b.bottomLeft.y && ball.bottomRight.y <= b.topLeft.y) {
        return true;
    }
    return false;
}

function stop() {
    gameIsOver = true;
    gameover.innerHTML = " Game over bozo...";
    document.removeEventListener('keydown', moveBat);
}

countdownInterval = setInterval(() => {
    countdown--;
    if (countdown === 0) {
        countdownElement.textContent = 'GO!';
    } else if (countdown < 0) {
        clearInterval(countdownInterval);
        splashScreen.style.display = 'none'; // Hide the splash screen
        requestAnimationFrame(moveBall);
    } else {
        countdownElement.textContent = countdown;
    }
}, 1000);
