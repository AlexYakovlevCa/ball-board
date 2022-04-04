var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/glew.jpg" />';

var ballOpts;
var gBoard;
var gGamerPos;
/// intervals
var gBallInterval;
var gScore = 0;
var restartButton;
var glueTimeout;
var removeAfter3;
var isGlue = false;

var sound = new Audio('eat.wav');

function initGame() {
  var restartButton = document.querySelector('.restart-btn');
  restartButton.style.display = 'none';
  gGamerPos = { i: 2, j: 9 };
  gBoard = buildBoard();
  renderBoard(gBoard);
  gBallInterval = setInterval(ballCreator, 5000);
  clearTimeout(removeAfter3);
}

function checkWin() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].gameElement === BALL) {
        console.log(gBoard[i][j].gameElement);
        return false;
      }
    }
  }
  console.log('wonnnnnnn');
  clearInterval(gBallInterval);
  return true;
}

function ballCreator() {
  ballOpts = [];
  var length = gBoard.length * gBoard[0].length;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j];
      if (
        gBoard[i][j].gameElement === null &&
        gBoard[i][j].type !== WALL &&
        gBoard[i][j].type !== GAMER
      )
        ballOpts.push(cell);
    }
  }
  var randomball = drawNum(ballOpts);
  var randomGlue = drawNum(ballOpts);
  randomball.gameElement = BALL;
  randomGlue.gameElement = GLUE;
  console.log(randomGlue);
  renderBoard(gBoard);
  removeAfter3 = setTimeout(() => {
    console.log(randomGlue);
    renderBoard(gBoard);
    randomGlue.gameElement = null;
	
  }, 3000);
  console.log('hey');
  
}

function buildBoard() {
  // Create the Matrix
  var board = createMat(10, 12);

  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      // Put FLOOR in a regular cell
      var cell = { type: FLOOR, gameElement: null };

      // Place Walls at edges
      if (
        i === 0 ||
        i === board.length - 1 ||
        j === 0 ||
        j === board[0].length - 1
      ) {
        cell.type = WALL;
      }

      // Add created cell to The game board
      board[i][j] = cell;
    }
  }

  // Place the gamer at selected position
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

  // Place the Balls (currently randomly chosen positions)
  board[3][8].gameElement = BALL;
  board[7][4].gameElement = BALL;
  board[0][6].type = FLOOR;
  board[9][6].type = FLOOR;
  board[5][0].type = FLOOR;
  board[5][11].type = FLOOR;
  //   board[4][4].gameElement =GLUE

  console.log(board);
  return board;
}

// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });

      // TODO - change to short if statement
      // if (currCell.type === FLOOR) cellClass += ' floor';
      // else if (currCell.type === WALL) cellClass += ' wall';
      cellClass += currCell.type === FLOOR ? ' floor' : ' wall';

      //TODO - Change To template string
      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '"  onclick="moveTo(' +
        i +
        ',' +
        j +
        ')" >\n';

      // TODO - change to switch case statement
      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG;
      } else if (currCell.gameElement === GLUE) {
        strHTML += GLUE_IMG;
      }
      strHTML += '\t</td>\n';
    }
    strHTML += '</tr>\n';
  }

  console.log('strHTML is:');
  // console.log(strHTML);
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  var targetCell = gBoard[i][j];
  if (targetCell.type === WALL || isGlue) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  var iAbsDiff = Math.abs(i - gGamerPos.i);
  var jAbsDiff = Math.abs(j - gGamerPos.j);

  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    (iAbsDiff === gBoard.length - 1 && jAbsDiff === 0) ||
    (jAbsDiff === gBoard[0].length - 1 && iAbsDiff === 0)
  ) {
    if (targetCell.gameElement === BALL) {
      console.log('Collecting!');
      gScore++;
      targetCell.gameElement = FLOOR;
      var isWin = checkWin();
      sound.play();
    }
    if (targetCell.gameElement === GLUE) {
      targetCell.gameElement = FLOOR;
      console.log('glueddd!!!!!');
      isGlue = true;
      glueTimeout = setTimeout(() => {
        isGlue = !isGlue;
      }, 3000);
      // clearTimeout(glueTimeout);
    }
    if (isWin) {
      var restartButton = document.querySelector('.restart-btn');
      restartButton.style.display = 'block';
    }

    // MOVING from current position
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // Dom:
    renderCell(gGamerPos, '');

    // MOVING to selected position
    // Model:
    gGamerPos.i = i;
    gGamerPos.j = j;
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    // DOM:
    renderCell(gGamerPos, GAMER_IMG);
  } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  var cellSelector = '.' + getClassName(location);
  var elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;
  //i= 0&&j=6
  switch (event.key) {
    case 'ArrowLeft':
      if (j === 0) j = gBoard[i].length;
      moveTo(i, j - 1);
      break;
    case 'ArrowRight':
      if (j === gBoard[i].length - 1) j = -1;
      moveTo(i, j + 1);
      break;
    case 'ArrowUp':
      if (i === 0) i = gBoard.length;
      moveTo(i - 1, j);
      break;
    case 'ArrowDown':
      if (i === gBoard.length - 1) i = -1;
      moveTo(i + 1, j);
      break;
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j;
  return cellClass;
}
