const radius = 20;
const width = radius * Math.sqrt(3);
const RED = "rgb(185,0,39)";
const BLUE = "rgb(0,94,132)"
var ctx;
var selected = [-1, -1];
var board;
var pastMoves = [];
var playerColor = 0;
var multiplayer = false;
var active = true;
var boardLength = 14;

function changeMode() {
    multiplayer = !multiplayer;
    playerColor = 0;
    init(boardLength);
    
}

function changeBoardLength(newLength) {
    if (Number.isNaN(parseInt(newLength)) || parseInt(newLength) < 1 || parseInt(newLength) > 16)
        return
    boardLength = parseInt(newLength);
    playerColor = 0;
    init(boardLength);
}

function undo() {
    if (active) {
        var a;
        if (pastMoves.length > 0) {
            a = pastMoves[pastMoves.length - 1];
            board[a[0]][a[1]] = -1;
            pastMoves.pop();
        }
        if (!multiplayer) {
            a = pastMoves[pastMoves.length - 1];
            board[a[0]][a[1]] = -1;
            pastMoves.pop();
        }
        playerColor = a[2];
        saveGameState();
        draw(board, playerColor, selected, width, radius, ctx);
    }
}

function getGameState() {
    return JSON.stringify({
        board: board,
        pastMoves: pastMoves,
        playerColor: playerColor,
        multiplayer: multiplayer,
        active: active,
        boardLength: boardLength
    })
}

function saveGameState(data=false) {
    localStorage.setItem('hexGameState', data ? data : getGameState());
}

function loadGameState() {
    const savedState = JSON.parse(localStorage.getItem('hexGameState'));
    if (savedState) {
        board = savedState.board;
        pastMoves = savedState.pastMoves;
        playerColor = savedState.playerColor;
        multiplayer = savedState.multiplayer;
        active = savedState.active;
        boardLength = savedState.boardLength;
    }
}

function exportGameData() {
    alert("Here is the game data:\n" + getGameState());
}

function importGameData() {
    let data = prompt("Paste game data here:")
    saveGameState(data);
    loadGameState();
    draw(board, playerColor, selected, width, radius, ctx);
    handleWinCheck();
}

function mouseDown(event) {
    getSelected(event);
    if (active) {
        if (selected[0] != -1 && selected[1] != -1) {
            pastMoves.push([selected[0], selected[1], playerColor]);
            board[selected[0]][selected[1]] = playerColor;
            if (multiplayer)
                playerColor = oppositeColor(playerColor);
            else
                botMove(monteCarloTreeSearch, board, pastMoves, playerColor);
            draw(board, playerColor, selected, width, radius, ctx);
            handleWinCheck();
        }
    }
    saveGameState();
}

function mouseMove(event) {
    getSelected(event);
    if (active)
        draw(board, playerColor, selected, width, radius, ctx);
}

function init(boardLength) {
    board = new Array(boardLength);
    for (var i = 0; i < boardLength; i++) {
        board[i] = new Array(boardLength);
        for (var j = 0; j < boardLength; j++)
            board[i][j] = -1;
    }
    pastMoves = [];
    active = true;
    saveGameState();
    draw(board, playerColor, selected, width, radius, ctx);
}

function load() {
    var canvas = document.getElementById("output");
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    const newGameButton = document.getElementById("new-game");
    newGameButton.onclick = () => {init(boardLength)};
    var monteCarloTreeSearch = new MonteCarloTreeSearch()
    canvas.onmousedown = mouseDown;
    canvas.onmousemove = mouseMove;
    if (localStorage.getItem("hexGameState") === null) {
        saveGameState();
    }
        
    loadGameState();
    document.getElementById("change-mode").checked = multiplayer;
    draw(board, playerColor, selected, width, radius, ctx);
    handleWinCheck(showAlerts = false);
}