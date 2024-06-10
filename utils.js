function findArr(arr, element) {
    for (var i = 0; i < arr.length; i++)
        if (positionsEqual(arr[i], element)) return i;
    return -1;
}

function colorsEqual(color1, color2) {
    for (let i = 0; i < color1.length; i++) {
        if (color1[i] !== color2[i]) return false;
    }
    return true;
}

function positionsEqual(move1, move2) {
    return move1[0] === move2[0] && move1[1] === move2[1];
}

function isInBoard(x, y, boardLength) {
    return x >= 0 && x < boardLength && y >= 0 && y < boardLength;
}

function statesEqual(state1, state2) {
    const boardLength = state1.length;
    for (let i = 0; i < boardLength; i++) {
        for (let j = 0; j < boardLength; j++) {
            if (state1[i][j] !== state2[j][i]) {
                return false;
            }
        }
    }
    return true;
}

function remainingSquares(state) {
    const boardLength = state.length;
    let total = 0;
    for (let i = 0; i < boardLength; i++) {
        for (let j = 0; j < boardLength; j++) {
            if (state[i][j] === -1) {
                total++;
            }
        }
    }
    return total;
}

function copyState(state) {
    const boardLength = state.length;
    let newState = [];
    for (let i = 0; i < boardLength; i++) {
        newState.push([]);
        for (let j = 0; j < boardLength; j++) {
            newState[i].push(state[i][j]);
        }
    }
    return newState;
}

function initBoard(boardLength) {
    let board = new Array(boardLength);
    for (var i = 0; i < boardLength; i++) {
        board[i] = new Array(boardLength);
        for (var j = 0; j < boardLength; j++) board[i][j] = -1;
    }
    return board;
}

function oppositeColor(color) {
    return 1 - color; // color === 0 ? 1 : 0;
}

function randomMove(board, blackList = null) {
    const boardLength = board.length;
    var move;
    do {
        move = [
            Math.floor(Math.random() * boardLength),
            Math.floor(Math.random() * boardLength),
        ];
    } while (
        board[move[0]][move[1]] != -1 ||
        (blackList !== null &&
            blackList.some((blackListedMove) => {
                return positionsEqual(blackListedMove, move);
            }))
    );
    return move;
}

function getPastMoves(board) {
    const boardLength = board.length
    let pastMoves = [];

    for (let i = 0; i < boardLength; i++) {
        for (let j = 0; j < boardLength; j++) {
            if (board[i][j] !== -1) {
                pastMoves.push([i, j, board[i][j]]);
            }
        }
    }
    return pastMoves;
}

Object.defineProperty(Array.prototype, "random", {
    value() {
        return this[Math.floor(Math.random() * this.length)];
    },
});
