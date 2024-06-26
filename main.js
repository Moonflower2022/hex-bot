const radius = 20;
const width = radius * Math.sqrt(3);
const RED = "rgb(185, 0, 39)";
const BLUE = "rgb(0, 94, 132)";
const YELLOW = "rgb(252, 237, 30)";
var ctx;
var selected = [-1, -1];
var pastMoves = [];
var playerColor = 0; // 0 is red and 1 is blue
var multiplayer = false;
var active = true;
var boardLength = 14;
var board = initBoard(boardLength);
var darkMode = false;
var worker;
var botStatus;

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
    navigator.clipboard.writeText(getGameState().replace(/[\r\n\t]+/g, ""));
    alert(
        "Here is the game data (already copied to clipboard):\n" +
            getGameState().replace(/[\r\n\t]+/g, "")
    );
}

function isValidJSON(input) {
    try {
        JSON.parse(input);
    } catch (e) {
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
        if (!positionsEqual(selected, [-1, -1])) {
            pastMoves.push([selected[0], selected[1], playerColor]);
            board[selected[0]][selected[1]] = playerColor;
            if (!checkWinPath(board, playerColor) && !multiplayer) {
                handleBotMove()
            }
            playerColor = oppositeColor(playerColor)
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

function handleBotMove() {
    if (window.Worker) {
        worker.postMessage([board, playerColor]);
        botStatus.innerHTML = "Running search...";
    } else {
        botMove(board, pastMoves, playerColor);
        playerColor = oppositeColor(playerColor)
    }
}

function initWebWorker() {
    if (window.Worker) {
        worker = new Worker("worker.js");

        worker.onmessage = function (message) {
            botStatus.innerHTML = "";

            const botMove = message.data;

            pastMoves.push([botMove[0], botMove[1], 1]);
            board[botMove[0]][botMove[1]] = 1;

            playerColor = oppositeColor(playerColor)

            draw(board, playerColor, selected, width, radius, ctx);
            handleWinCheck();
        };
    } else {
        console.log(
            "Your browser does not support web workers, defaulting to running script on main thread."
        );
    }
}

function init(boardLength) {
    board = initBoard(boardLength);
    playerColor = 0;
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
    botStatus = document.getElementById("bot-status");
    initWebWorker();
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
