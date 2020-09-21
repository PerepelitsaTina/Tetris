const field = document.getElementById('field');
const context = field.getContext('2d');
const grid = 30;
let figureSequence = [];
let playfield = [];
let score = 0;
const scoreValue = document.querySelector('.score-value');

let speed;

const buttons = document.querySelector('.buttons');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');

const recordValue = document.querySelector('.record-value');
let record = +localStorage.getItem('record') || 0;
recordValue.innerHTML = record;

const restart = document.querySelector('.restart');
const pause = document.querySelector('.pause');
const play = document.querySelector('.play');

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

const colorsArray = [
  '#d91e1e',
  '#3a40e0',
  '#3ae0e0',
  '#f2eb0c',
  '#f578da',
  '#03a100',
  '#f56905'
];

for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
};

let count = 0;
let figure = getNextFigure();
let rAF = null;
let gameOver = false;

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
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    figureSequence.push(name);
  }
};

function getNextFigure() {
  if (figureSequence.length === 0) {
    generateSequence();
  }
  const name = figureSequence.pop();
  const matrix = figures[name];
  const color = colorsArray[getRandomInt(0, colorsArray.length - 1)];
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === 'I' ? -1 : -2;

  return {
    name: name,
    matrix: matrix,
    row: row,
    col: col,
    color: color
  }
};

function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );
  return result;
};

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
};

function speedUp(score) {
  if (!score % 10 === 0 || speed <= 5) {
    return;
  }
  speed = speed - 5;
};

function scoreUp() {
  score += 10;
  scoreValue.innerHTML = score;
  checkRecord();
};

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;
  const gameOverMessage = document.querySelector('.game-over');
  gameOverMessage.style.opacity = '1';
};

function checkRecord() {
  if (record >= score) {
    return;
  }
  localStorage.record = score;
  recordValue.innerHTML = score;
};

function placeFigure() {
  for (let row = 0; row < figure.matrix.length; row++) {
    for (let col = 0; col < figure.matrix[row].length; col++) {
      if (figure.matrix[row][col]) {
        if (figure.row + row < 0) {
          return showGameOver();
        }
        playfield[figure.row + row][figure.col + col] = figure.color;
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
      speedUp();
    }
    else {
      row--;
    }
  }
  figure = getNextFigure();
};

function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, field.width, field.height);
  drawGrid();

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        context.fillStyle = playfield[row][col];
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
    context.fillStyle = figure.color;

    for (let row = 0; row < figure.matrix.length; row++) {
      for (let col = 0; col < figure.matrix[row].length; col++) {
        if (figure.matrix[row][col]) {
          context.fillRect((figure.col + col) * grid, (figure.row + row) * grid, grid - 1, grid - 1);
        }
      }
    }
  }
};

restart.addEventListener('click', function () {
  window.location.reload();
});

pause.addEventListener('click', function () {
  cancelAnimationFrame(rAF);
});

play.addEventListener('click', function () {
  requestAnimationFrame(loop);
});

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
};

window.addEventListener('keydown', function (event) {
  if (gameOver) {
    return;
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const col = event.key === 'ArrowLeft'
      ? figure.col - 1
      : figure.col + 1;
    if (canMove(figure.matrix, figure.row, col)) {
      figure.col = col;
    }
  };

  if (event.key === 'ArrowUp') {
    const matrix = rotate(figure.matrix);
    if (canMove(matrix, figure.row, figure.col)) {
      figure.matrix = matrix;
    } else {
      const { name, col } = figure;
      if (col < 0) {
        name === 'I' ? figure.col += 2 : figure.col += 1;
        figure.matrix = matrix;
      } else {
        name === 'I' ? figure.col -= 2 : figure.col -= 1;
        figure.matrix = matrix;
      }
    }
  };

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