const prompt = document.getElementById("prompt");
const gameOver = document.getElementById("game-over");
const playerTurn = document.getElementById("player-turn");
const winnerEle = document.getElementById("winner");

const startButton = document.querySelector(".start-game");
startButton.addEventListener("click", () => {
  changePhaseTo(PLAYING);
});

const resetButton = document.querySelector(".reset-game");
resetButton.addEventListener("click", () => {
  resetInitialState();
  changePhaseTo(NEW);
  clearHTMLBoard();
  updateHTMLBoard();
});

const board = document.getElementById("board");
board.addEventListener("click", (e) => {
  onBoardClick(e.target);
});

function onBoardClick(e) {
  let [y, x] = e.attributes.getNamedItem("data-coordinates").value.split(",");
  processPlayerMove(y, x);
}

const gameState = {};

//Game states
const PLAYING = "PLAYING";
const GAME_OVER = "GAME_OVER";
const NEW = "NEW";

//Game over states
const DRAW = "DRAW";
const PLAYER_X = "Player X Wins!";
const PLAYER_O = "Player O Wins!";

function resetInitialState() {
  (gameState.players = ["O", "X"]),
    (gameState.board = newBoard()),
    (gameState.currentPlayer =
      gameState.players[Math.floor(Math.random() * 2)]),
    (gameState.phase = NEW),
    (gameState.winner = null);
}

function newBoard() {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

function changePhaseTo(newPhase) {
  gameState.phase = newPhase;

  if (gameState.phase === NEW) {
    prompt.style.display = "block";
    gameOver.style.display = "none";
  } else if (gameState.phase === PLAYING) {
    prompt.style.display = "none";
    playerTurn.style.display = "block";
  } else if (gameState.phase === GAME_OVER) {
    // clearHTMLBoard();
    playerTurn.style.display = "none";
    gameOver.style.display = "block";
    console.log(gameState.winner);
    winnerEle.innerText = gameState.winner;
  }
}

function processPlayerMove(y, x) {
  if (gameState.phase !== PLAYING) {
    return;
  } else if (gameState.board[y][x]) {
    console.log("Illegal move");
  } else {
    gameState.board[y][x] = gameState.currentPlayer;
    checkBoard();
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
    updateHTMLBoard();
  }
}

function checkBoard() {
  if (checkRows() || checkColumns() || checkDiagonals()) {
    //If any check returns a match, declare winner
    gameState.winner = gameState.currentPlayer === "X" ? PLAYER_X : PLAYER_O;
    changePhaseTo(GAME_OVER);
    updateHTMLBoard();
  } else if (!hasValidMoves()) {
    gameState.winner = DRAW;
    changePhaseTo(GAME_OVER);
  }
}

function checkRows() {
  for (let x = 0; x < gameState.board.length; x++) {
    let rowResult = false;
    let row = getRow(x);

    rowResult = row.every((value) => {
      return value && value === row[0]; //If every value is populated and matches index 0
    });

    if (rowResult) {
      console.log("row match found");
      return true;
    }
  }
  return false;
}

function checkColumns() {
  for (let x = 0; x < gameState.board.length; x++) {
    let columnResult = false;
    let column = getColumn(x);

    columnResult = column.every((value) => {
      return value && value === column[0]; //If every value is populated and matches index 0
    });

    if (columnResult) {
      console.log("column match found");
      return true;
    }
  }
  return false;
}

function checkDiagonals() {
  let diagonals = getDiagonals();
  let diagonalResult = false;
  for (let y = 0; y < diagonals.length; y++) {
    diagonalResult = diagonals[y].every((value) => {
      return value && value === diagonals[y][0]; //If every value is populated and matches index 0
    });

    if (diagonalResult) {
      console.log("diagonal match found");
      return true;
    }
  }
  return false;
}

function hasValidMoves() {
  for (let x = 0; x < gameState.board.length; x++) {
    for (let y = 0; y < gameState.board[x].length; y++) {
      if (!gameState.board[y][x]) {
        return true;
      }
    }
  }
  return false;
}

//AI Logic
const aiPlayer = {};

function initializeComputerPlayer() {
  aiPlayer.id = "O";
  aiPlayer.interval = setInterval(isComputerTurn(), "500");
  // aiPlayer.board = gameState.board;
  aiPlayer.validMoves = [];
  aiPlayer.board = gameState.board; //Board for predicting a winning computer move
}

function isComputerTurn() {
  if (gameState.board.currentPlayer === aiPlayer.id) {
    processComputerTurn();
  }
}

function processComputerTurn() {
  aiPlayer.validMoves = []; //Reset move array after every turn
  buildValidMoves();
  aiPlayer.board = gameState.board;
  let move = selectComputerMove();
  processPlayerMove(move);
}

function buildValidMoves() {
  gameState.board.forEach((yValue, yIndex, yArray) => {
    yArray.forEach((xValue, xIndex) => {
      if (!gameState.board[yIndex][xIndex]) {
        console.log(
          `blank value found at yIndex value ${yIndex}, xIndex value ${xIndex}`
        );
      }
    });
  });
}

function selectComputerMove() {
  if (aiPlayer.validMoves > 0) {
    aiPlayer.validMoves.forEach(() => {
      //build predicted move board
      //check if win and send move if found
      //else send random move
    });
  } else {
    console.log("error");
  }
  // return selected move (y, x);
}

function updateHTMLBoard() {
  let cells = gameState.board;
  cells.forEach((currentRow, yIndex) => {
    currentRow.forEach((cellValue, xIndex) => {
      if (cellValue) {
        let element = document.querySelector(
          `div[data-coordinates='${yIndex},${xIndex}']`
        );
        element.classList.add(`player${cellValue}`);
        element.innerText = cellValue;
      }
    });
  });

  let playerElement = document.getElementById("player");
  playerElement.innerText = gameState.currentPlayer;
  playerElement.classList = `player${gameState.currentPlayer}`;
}

function clearHTMLBoard() {
  document.querySelectorAll(".cell").forEach((e) => {
    //"div"
    e.classList.remove("playerX");
    e.classList.remove("playerO");
    e.innerText = "";
  });
}

function getRow(index) {
  return gameState.board[index];
}

function getColumn(index) {
  let result = [];
  for (let y = 0; y < gameState.board.length; y++) {
    result.push(gameState.board[y][index]);
  }
  return result;
}

function getDiagonals() {
  let result = [];
  let xPos = 0;
  let yPos = 0;
  for (let n = 0; n < 2; n++) {
    result[n] = [];
    for (let z = 0; z < gameState.board.length; z++) {
      if (n === 0) {
        result[n].push(gameState.board[yPos][xPos]);
        xPos++;
        yPos++;
      } else if (n === 1) {
        result[n].push(gameState.board[yPos][xPos]);
        xPos--;
        yPos++;
      }
    }
    xPos = gameState.board.length - 1;
    yPos = 0;
  }
  return result;
}

resetInitialState();
updateHTMLBoard();
