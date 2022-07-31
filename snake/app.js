const prompt = document.getElementById("prompt");
const gameOver = document.getElementById("game-over");
let scoreElem = document.getElementById("score");

const startButton = document.querySelector(".start-game");
startButton.addEventListener("click", function () {
  changePhaseTo(PLAYING);
  gameControls.style.display = "grid";
  prompt.style.display = "none";
});

const resetButton = document.querySelector(".reset-game");
resetButton.addEventListener("click", () => {
  resetInitialState();
  prompt.style.display = "block";
  gameOver.style.display = "none";
  clearHTMLBoard();
  updateHTMLBoard();
});

const gameControls = document.getElementById("controls");
gameControls.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") {
    return;
  }
  turnSnake(e.target.innerText.toUpperCase());
});

let keyPress = document.addEventListener("keydown", (e) => {
  if (e.keyCode === 38) {
    e.preventDefault();
    turnSnake("UP");
  } else if (e.keyCode === 40) {
    e.preventDefault();
    turnSnake("DOWN");
  } else if (e.keyCode === 37) {
    turnSnake("LEFT");
  } else if (e.keyCode === 39) {
    turnSnake("RIGHT");
  }
});

//Game states
const PLAYING = "PLAYING";
const GAME_OVER = "GAME_OVER";
const NEW = "NEW";

//Game directions
const LEFT = "LEFT";
const RIGHT = "RIGHT";
const UP = "UP";
const DOWN = "DOWN";

let gameState = {};

function newBoard() {
  return [
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
  ];
}

function resetInitialState() {
  (gameState.board = newBoard()),
    (gameState.apple = [5, 5]),
    (gameState.snake = {
      body: [
        [10, 5],
        [10, 6],
        [10, 7],
        [10, 8],
      ],
      nextDirection: [0, -1],
    }),
    (gameState.speed = 300);
  gameState.phase = NEW;
  gameState.setInterval = null;
  gameState.score = 0;
}

function changePhaseTo(newPhase) {
  gameState.phase = newPhase;

  if (gameState.phase === PLAYING) {
    gameState.interval = setInterval(tick, gameState.speed);
  } else if (gameState.phase === GAME_OVER) {
    clearInterval(gameState.interval);
    clearHTMLBoard();
    gameControls.style.display = "none";
    gameOver.style.display = "block";
  }
}

function tick() {
  clearHTMLBoard();
  moveSnake();
  updateHTMLBoard();
}

function moveSnake() {
  const [y, x] = gameState.snake.body[0];
  const nextTile = [
    y + gameState.snake.nextDirection[0],
    x + gameState.snake.nextDirection[1],
  ];

  const [nextY, nextX] = nextTile;

  if (nextY > 11 || nextY < 0 || nextX > 11 || nextX < 0) {
    changePhaseTo(GAME_OVER);
  } else if (gameState.board[nextY][nextX] === "snake") {
    changePhaseTo(GAME_OVER);
  } else {
    if (gameState.board[nextY][nextX] === "apple") {
      moveApple();
      gameState.score++;
    } else {
      gameState.snake.body.pop();
    }
    gameState.snake.body.unshift(nextTile);
    gameState.board = newBoard();
    addAppleToBoard();
    addSnakeToBoard();
  }
}

function addAppleToBoard() {
  const [y, x] = gameState.apple;
  gameState.board[y][x] = "apple";
}

function addSnakeToBoard() {
  for (let i = 0; i < gameState.snake.body.length; i++) {
    const [y, x] = gameState.snake.body[i];
    gameState.board[y][x] = "snake";
  }
}

function moveApple() {
  let y = Math.floor(Math.random() * 12);
  let x = Math.floor(Math.random() * 12);
  if (gameState.apple === [y, x]) {
    //If random location already has an apple
    moveApple();
    return;
  } else if (gameState.board[y][x] === "snake") {
    moveApple();
    return;
  }
  gameState.apple = [y, x];
}

function updateHTMLBoard() {
  let appleCell = document.querySelector(
    "div[data-coordinates='" + gameState.apple + "']"
  );
  appleCell.classList.add("apple");

  let snakeCells = gameState.snake.body;
  snakeCells.forEach((currentCell) => {
    document
      .querySelector("div[data-coordinates='" + currentCell + "']")
      .classList.add("snake");
  });

  scoreElem.innerHTML = gameState.score;
}

function clearHTMLBoard() {
  document.querySelectorAll("div").forEach((e) => {
    e.classList.remove("snake");
    e.classList.remove("apple");
  });
}

function turnSnake(direction) {
  if (direction === LEFT) gameState.snake.nextDirection = [0, -1];
  else if (direction === RIGHT) gameState.snake.nextDirection = [0, 1];
  else if (direction === UP) gameState.snake.nextDirection = [-1, 0];
  else if (direction === DOWN) gameState.snake.nextDirection = [1, 0];
}

resetInitialState();
updateHTMLBoard();
