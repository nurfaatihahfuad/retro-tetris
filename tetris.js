/**
 * TETRIS.JS - Retro 1-Bit Edition
 * Features: Classic Logic + Mobile Swipe Controls
 */

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Skalakan kanvas (20px per blok)
context.scale(20, 20);

// 1. LOGIK ARENA & PIECE
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
        ];
    } else if (type === 'J') {
        return [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [1, 1],
            [1, 1],
        ];
    } else if (type === 'Z') {
        return [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    }
}

// 2. FUNGSI LUKIS (1-BIT STYLE)
function draw() {
    // Latar belakang putih
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Blok hitam dengan border putih halus
                context.fillStyle = '#000';
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.lineWidth = 0.05;
                context.strokeStyle = '#fff';
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// 3. LOGIK PERMAINAN
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// 4. KAWALAN PLAYER
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function updateScore() {
    scoreElement.innerText = player.score;
}

// 5. ANIMASI LOOP
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

// 6. EVENT LISTENERS (KEYBOARD)
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) playerMove(-1);        // Left
    else if (event.keyCode === 39) playerMove(1);     // Right
    else if (event.keyCode === 40) playerDrop();      // Down
    else if (event.keyCode === 38) playerRotate(1);   // Up (Rotate)
    else if (event.keyCode === 81) playerRotate(-1);  // Q (Rotate Left)
    else if (event.keyCode === 87) playerRotate(1);   // W (Rotate Right)
});

// 7. SWIPE CONTROLS (MOBILE)
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, {passive: false});

canvas.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // Tentukan arah swipe (paksi X atau Y yang lebih dominan)
    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal Swipe
        if (Math.abs(dx) > 30) {
            playerMove(dx > 0 ? 1 : -1);
        }
    } else {
        // Vertical Swipe
        if (dy > 30) {
            playerDrop(); // Swipe bawah untuk laju
        } else if (dy < -30) {
            playerRotate(1); // Swipe atas untuk pusing
        }
    }
    e.preventDefault();
}, {passive: false});

// 8. INITIALIZE
document.getElementById('start-btn').addEventListener('click', () => {
    playerReset();
    updateScore();
    update();
    // Sorok butang selepas mula
    document.getElementById('start-btn').style.display = 'none';
});
