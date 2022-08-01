const prompt = document.getElementById("prompt");
const gameOver = document.getElementById("game-over");
const playerTurn = document.getElementById("player-turn");
const winnerEle = document.getElementById("winner");

const resetButton = document.querySelector(".reset-game");
resetButton.addEventListener("click", () => {
  resetInitialState();
  changePhaseTo(NEW);
  clearHTMLBoard();
  updateHTMLBoard();
});

const playerButtons = document.querySelectorAll(".player-select");
playerButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (e.target.innerText === "COMPUTER") {
      initializeComputerPlayer();
    }
    changePhaseTo(PLAYING);
  });
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
const COMPUTER_O = "Computer O Wins!";

function resetInitialState() {
  (gameState.players = ["O", "X"]),
    (gameState.board = newBoard()),
    (gameState.currentPlayer =
      gameState.players[Math.floor(Math.random() * 2)]),
    (gameState.phase = NEW),
    (gameState.winner = null),
    (gameState.hasAiPlayer = false);
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
    playerTurn.style.display = "none";
    gameOver.style.display = "block";

    winnerEle.innerText = gameState.winner;
    clearInterval(aiPlayer.interval);
  }
}

function processPlayerMove(y, x) {
  if (gameState.phase !== PLAYING) {
    return;
  } else if (gameState.board[y][x]) {
    alert("Illegal move");
  } else {
    gameState.board[y][x] = gameState.currentPlayer;
    checkBoard();
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
    updateHTMLBoard();
  }
}

function checkBoard() {
  if (
    checkRows(gameState.board) ||
    checkColumns(gameState.board) ||
    checkDiagonals(gameState.board)
  ) {
    //If any check returns a match, declare winner
    if (gameState.hasAiPlayer) {
      gameState.winner =
        gameState.currentPlayer === "X" ? PLAYER_X : COMPUTER_O;
    } else {
      gameState.winner = gameState.currentPlayer === "X" ? PLAYER_X : PLAYER_O;
    }
    changePhaseTo(GAME_OVER);
    updateHTMLBoard();
  } else if (!hasValidMoves()) {
    gameState.winner = DRAW;
    changePhaseTo(GAME_OVER);
  }
}

function checkRows(board) {
  for (let x = 0; x < board.length; x++) {
    let rowResult = false;
    let row = getRow(board, x);

    rowResult = row.every((value) => {
      return value && value === row[0]; //If every value is populated and matches index 0
    });

    if (rowResult) {
      return true;
    }
  }
  return false;
}

function checkColumns(board) {
  for (let x = 0; x < board.length; x++) {
    let columnResult = false;
    let column = getColumn(board, x);

    columnResult = column.every((value) => {
      return value && value === column[0]; //If every value is populated and matches index 0
    });

    if (columnResult) {
      return true;
    }
  }
  return false;
}

function checkDiagonals(board) {
  let diagonals = getDiagonals(board);
  let diagonalResult = false;
  for (let y = 0; y < diagonals.length; y++) {
    diagonalResult = diagonals[y].every((value) => {
      return value && value === diagonals[y][0]; //If every value is populated and matches index 0
    });

    if (diagonalResult) {
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
  gameState.hasAiPlayer = true;
  aiPlayer.id = "O";
  aiPlayer.validMoves = [];
  aiPlayer.board = newBoard(); //Board for predicting a winning computer move
  aiPlayer.interval = setInterval(() => {
    isComputerTurn();
  }, "1000");
}

function isComputerTurn() {
  if (gameState.currentPlayer === aiPlayer.id) {
    processComputerTurn();
  }
}

function processComputerTurn() {
  aiPlayer.validMoves = []; //Reset valid move array after every turn
  buildValidMoves();
  let [y, x] = selectComputerMove();
  processPlayerMove(y, x);
}

function buildValidMoves() {
  gameState.board.forEach((yValue, yIndex, yArray) => {
    yArray.forEach((xValue, xIndex) => {
      if (!gameState.board[yIndex][xIndex]) {
        aiPlayer.validMoves.push([yIndex, xIndex]);
      }
    });
  });
}

function selectComputerMove() {
  if (aiPlayer.validMoves.length > 0) {
    let randomIndex = Math.floor(Math.random() * aiPlayer.validMoves.length);
    let selectedMove = aiPlayer.validMoves[randomIndex];

    for (let z = 0; z < aiPlayer.validMoves.length; z++) {
      aiPlayer.board = rebuildPredictionBoard(gameState.board); //Reinitialize prediction board
      let ySelected = aiPlayer.validMoves[z][0];
      let xSelected = aiPlayer.validMoves[z][1];
      aiPlayer.board[ySelected][xSelected] = aiPlayer.id; //Select a prediction

      if (
        checkRows(aiPlayer.board) ||
        checkColumns(aiPlayer.board) ||
        checkDiagonals(aiPlayer.board)
      ) {
        //If winning move is found, select it
        selectedMove = aiPlayer.validMoves[z];
        break;
      }
    }

    return selectedMove;
  }
}

function rebuildPredictionBoard(board) {
  let predictionBoard = newBoard();
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      predictionBoard[y][x] = board[y][x];
    }
  }
  return predictionBoard;
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
    e.classList.remove("playerX");
    e.classList.remove("playerO");
    e.innerText = "";
  });
}

function getRow(board, index) {
  return board[index];
}

function getColumn(board, index) {
  let result = [];
  for (let y = 0; y < board.length; y++) {
    result.push(board[y][index]);
  }
  return result;
}

function getDiagonals(board) {
  let result = [];
  let xPos = 0;
  let yPos = 0;
  for (let n = 0; n < 2; n++) {
    result[n] = [];
    for (let z = 0; z < board.length; z++) {
      if (n === 0) {
        result[n].push(board[yPos][xPos]);
        xPos++;
        yPos++;
      } else if (n === 1) {
        result[n].push(board[yPos][xPos]);
        xPos--;
        yPos++;
      }
    }
    xPos = board.length - 1;
    yPos = 0;
  }
  return result;
}

resetInitialState();
updateHTMLBoard();
