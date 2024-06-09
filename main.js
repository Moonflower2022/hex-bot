const radius = 20;
const width = radius * Math.sqrt(3);
const RED = "rgb(185, 0, 39)";
const BLUE = "rgb(0, 94, 132)";
const YELLOW = "rgb(252, 237, 30)"
var ctx;
var selected = [-1, -1];
var board;
var pastMoves = [];
var playerColor = 0; // 0 is red and 1 is blue
var multiplayer = false;
var active = true;
var boardLength = 14;
var darkMode = false;

function changeMode() {
    multiplayer = !multiplayer;
    playerColor = 0;
    init(boardLength);
}

function changeBoardLength(newLength) {
    if (
        Number.isNaN(parseInt(newLength)) ||
        parseInt(newLength) < 1 ||
        parseInt(newLength) > 15
    )
        return;
    boardLength = parseInt(newLength);
    playerColor = 0;
    init(boardLength);
}

function undo() {
    if (active) {
        var pastMove;
        if (pastMoves.length > 0) {
            pastMove = pastMoves[pastMoves.length - 1];
            board[pastMove[0]][pastMove[1]] = -1;
            pastMoves.pop();
        }
        if (!multiplayer) {
            pastMove = pastMoves[pastMoves.length - 1];
            board[pastMove[0]][pastMove[1]] = -1;
            pastMoves.pop();
        }
        playerColor = pastMove[2];
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
        boardLength: boardLength,
        darkMode: darkMode,
    });
}

function saveGameState(data = false) {
    localStorage.setItem("hexGameState", data ? data : getGameState());
}

function loadGameState() {
    const savedState = JSON.parse(localStorage.getItem("hexGameState"));
    if (savedState) {
        board = savedState.board;
        pastMoves = savedState.pastMoves;
        playerColor = savedState.playerColor;
        multiplayer = savedState.multiplayer;
        active = savedState.active;
        boardLength = savedState.boardLength;
        darkMode = savedState.darkMode;
    }
}

function exportGameData() {
    navigator.clipboard.writeText(getGameState().replace(/[\r\n\t]+/g, ""))
    alert("Here is the game data (already copied to clipboard):\n" + getGameState().replace(/[\r\n\t]+/g, ""));
}


function isValidJSON(input) {
    try {
        // Try to parse the input string as JSON
        JSON.parse(input);

    } catch (e) {
        // If parsing fails, return false
        return false;
    }
    return true;
}

function importGameData(data) {
    if (!isValidJSON(data)) {
        alert("There was an issue importing your data. Please try again.");
        return;
    }
    JSON.parse(data);
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
            if (!checkWin(board, playerColor)) {
                if (multiplayer) playerColor = oppositeColor(playerColor);
                else botMove(board, pastMoves, playerColor);
            }
            draw(board, playerColor, selected, width, radius, ctx);
            handleWinCheck();
        }
    }
    saveGameState();
}

function mouseMove(event) {
    getSelected(event);
    if (active) draw(board, playerColor, selected, width, radius, ctx);
}

function applyDarkMode(darkMode) {
    var texts = document.getElementsByClassName("dark-mode-text");
    for (var i = 0; i < texts.length; i++) {
        texts[i].style.color = darkMode ? "white" : "black";
    }
    document.body.style.backgroundColor = darkMode
        ? "rgb(41, 44, 51)"
        : "rgb(255, 255, 255)";
}

function switchDarkMode() {
    darkMode = !darkMode;
    applyDarkMode(darkMode);
    saveGameState();
}

function botMove(board, hist, playerColor) {
    move = monteCarloTreeSearch(board, playerColor, 10, 1, 1);
    hist.push([move[0], move[1], 1]);
    board[move[0]][move[1]] = 1;
}

function init(boardLength) {
    board = new Array(boardLength);
    for (var i = 0; i < boardLength; i++) {
        board[i] = new Array(boardLength);
        for (var j = 0; j < boardLength; j++) board[i][j] = -1;
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
    newGameButton.onclick = () => {
        init(boardLength);
    };
    canvas.onmousedown = mouseDown;
    canvas.onmousemove = mouseMove;
    if (localStorage.getItem("hexGameState") === null) {
        saveGameState();
    }
    loadGameState();
    applyDarkMode(darkMode);
    document.getElementById("change-mode").checked = multiplayer;
    document.getElementById("switch-dark-mode").checked = darkMode;
    draw(board, playerColor, selected, width, radius, ctx);
    handleWinCheck((showAlerts = false));
}
