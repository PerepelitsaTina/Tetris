const field = document.getElementById('field');
const context = field.getContext('2d');
const grid = 30;
let figureSequence = [];
let playfield = [];

function drawGrid() {
  for (let i = 0; i < 9; i++) {
    context.lineWidth = 2;
    context.strokeStyle = '#363535'
    context.beginPath();
    context.moveTo(grid + i * grid, 0);
    context.lineTo(grid + i * grid, 600);
    context.stroke();
  }
  for (let j = 0; j < 19; j++) {
    context.lineWidth = 2;
    context.strokeStyle = '#363535'
    context.beginPath();
    context.moveTo(0, grid + j * grid);
    context.lineTo(300, grid + j * grid);
    context.stroke();
  }
}

for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}


const figures = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  'J': [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'L': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'O': [
    [1, 1],
    [1, 1],
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  'T': [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ]
};

const colors = {
  'I': '#d91e1e',
  'L': '#3a40e0',
  'J': '#3ae0e0',
  'S': '#f2eb0c',
  'Z': '#f578da',
  'T': '#03a100',
  'O': '#f56905'
};

let count = 0;
let figure = getNextFigure();
let rAF = null;
let gameOver = false;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    figureSequence.push(name);
  }
}

function getNextFigure() {
  if (figureSequence.length === 0) {
    generateSequence();
  }
  const name = figureSequence.pop();
  const matrix = figures[name];

  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === 'I' ? -1 : -2;

  return {
    name: name,
    matrix: matrix,
    row: row,
    col: col,
  };
}

function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );
  return result;
}

function canMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
        cellCol + col < 0 ||
        cellCol + col >= playfield[0].length ||
        cellRow + row >= playfield.length ||
        playfield[cellRow + row][cellCol + col])
      ) {
        return false;
      }
    }
  }
  return true;
}

let speed = 50;

// function speedUp(n) {
//   if (!score % 10 === 0 || speed <= 5) {
//     return;
//   }
//   console.log('speed');
//   speed -= 5;
// }

let score = 0;
const scoreValue = document.querySelector('.score-value');

function scoreUp() {
  score += 10;
  scoreValue.innerHTML = score;
  checkRecord();
}

const recordValue = document.querySelector('.record-value');
let record = +localStorage.getItem('record') || 0;
recordValue.innerHTML = record;

function checkRecord() {
  if (record >= score) {
    return;
  }
  localStorage.record = score;
  recordValue.innerHTML = score;
}

function placeFigure() {
  for (let row = 0; row < figure.matrix.length; row++) {
    for (let col = 0; col < figure.matrix[row].length; col++) {
      if (figure.matrix[row][col]) {

        if (figure.row + row < 0) {
          return showGameOver();
        }
        playfield[figure.row + row][figure.col + col] = figure.name;
      }
    }
  }

  for (let row = playfield.length - 1; row >= 0;) {
    if (playfield[row].every(cell => !!cell)) {
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c];
        }
      }
      scoreUp();
    }
    else {
      row--;
    }
  }
  figure = getNextFigure();
}

const restart = document.querySelector('.restart'),
      pause = document.querySelector('.pause'),
      play = document.querySelector('.play');

restart.addEventListener('click', function() {
  window.location.reload();
});

pause.addEventListener('click', function() {
  cancelAnimationFrame(rAF);
});

play.addEventListener('click', function() {
  requestAnimationFrame(loop);
})

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;
  let gameOverMessage = document.querySelector('.game-over');
  gameOverMessage.style.opacity = '1';
}

// function reset() {
//   playfield = playfield.map(row => {
//     return row.map(item => 0);
//   });
//   score = 0;
// }

let buttons = document.querySelector('.buttons'),
  modal = document.querySelector('.modal'),
  overlay = document.querySelector('.overlay');

  buttons.addEventListener('click', function (event) {
    if (event.target === buttons.children[0]) {
      speed = 50;
    }
    else {
      speed = 25;
    }
    modal.style.display = 'none';
    overlay.style.display = 'none';
    game();
  });

  function game() {
    rAF = requestAnimationFrame(loop);
  }


function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, field.width, field.height);
  drawGrid();

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];

        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }

  if (figure) {
    if (++count > speed) {
      figure.row++;
      count = 0;

      if (!canMove(figure.matrix, figure.row, figure.col)) {
        figure.row--;
        placeFigure();
      }
    }

    context.fillStyle = colors[figure.name];

    for (let row = 0; row < figure.matrix.length; row++) {
      for (let col = 0; col < figure.matrix[row].length; col++) {
        if (figure.matrix[row][col]) {

          context.fillRect((figure.col + col) * grid, (figure.row + row) * grid, grid - 1, grid - 1);
        }
      }
    }
  }
}

window.addEventListener('keydown', function (event) {
  if (gameOver) return;

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const col = event.key === 'ArrowLeft'
      ? figure.col - 1
      : figure.col + 1;

    if (canMove(figure.matrix, figure.row, col)) {
      figure.col = col;
    }
  }

  if (event.key === 'ArrowUp') {
    const matrix = rotate(figure.matrix);
    if (canMove(matrix, figure.row, figure.col)) {
      figure.matrix = matrix;
    }
  }

  if (event.key === 'ArrowDown') {
    const row = figure.row + 1;
    if (!canMove(figure.matrix, row, figure.col)) {
      figure.row = row - 1;
      placeFigure();
      return;
    }
    figure.row = row;
  }

});
// rAF = requestAnimationFrame(loop);



