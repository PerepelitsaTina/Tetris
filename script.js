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

const colors = [
  '#d91e1e',
  '#3a40e0',
  '#3ae0e0',
  '#f2eb0c',
  '#f578da',
  '#03a100',
  '#f56905'
];

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
    color: colors[getRandomInt(0, colors.length - 1)]
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

let score = 0;
const scoreValue = document.querySelector('.score-value');

function scoreUp() {
  score += 10;
  scoreValue.innerHTML = score;
}

let record = 0;
const recordValue = document.querySelector('.record-value');

function checkRecord() {
  if (record >= score) {
    return;
  }
  record = score;
  recordValue.innerHTML = record;
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

let speed = 50;

function chooseSpeed() {
  let speedRadios = document.getElementsByName('speed');
  if (speedRadios[0].checked) {
    speed = 50;
  }
  if (speedRadios[1].checked) {
    speed = 25;
  }
}

function speedUp() {
  if (!score % 10 === 0 || speed <= 5) {
    return;
  }
  speed -= 5;
}

const start = document.querySelector('.start');

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;
  checkRecord();
  let gameOverMessage = document.querySelector('.game-over');
  gameOverMessage.style.opacity = '1';
}

function loop() {
  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, field.width, field.height);
  drawGrid();

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = figure.color;

        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }
  chooseSpeed();

  if (figure) {
    if (++count > speed) {
      figure.row++;
      count = 0;

      if (!canMove(figure.matrix, figure.row, figure.col)) {
        figure.row--;
        placeFigure();
        speedUp();
      }
    }

    context.fillStyle = colors[getRandomInt(0, colors.length - 1)];

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


rAF = requestAnimationFrame(loop);

