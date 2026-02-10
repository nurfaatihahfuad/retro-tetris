const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

context.scale(20, 20);

// Lukis kotak dengan gaya 1-bit
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = '#000';
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.strokeStyle = '#fff'; // Border putih kecil antara blok
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Logik piece, collision, dan gravity akan diletakkan di sini...
// (Saya ringkaskan untuk struktur, anda boleh masukkan logik penuh Tetris)
