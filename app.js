const radius = 20;
const width = radius * Math.sqrt(3);
const RED = "rgb(185,0,39)";
const BLUE = "rgb(0,94,132)"
var ctx;
var selected = [-1, -1];
var board;
var past_moves = [];
var playerColor = 0;
var multiplayer = false;
var active = true;

function changeMode() {
    multiplayer = !multiplayer;
    playerColor = 0;
    init();
    saveGameState();
}

function undo() {
    if (active) {
        var a;
        if (past_moves.length > 0) {
            a = past_moves[past_moves.length - 1];
            board[a[0]][a[1]] = -1;
            past_moves.pop();
        }
        if (!multiplayer) {
            a = past_moves[past_moves.length - 1];
            board[a[0]][a[1]] = -1;
            past_moves.pop();
        }
        playerColor = a[2];
        saveGameState();
        draw(board, playerColor, selected, ctx);
    }
}

function getGameState() {
    return JSON.stringify({
        board: board,
        past_moves: past_moves,
        playerColor: playerColor,
        multiplayer: multiplayer,
        active: active
    })
}

function saveGameState(data=false) {
    localStorage.setItem('hexGameState', data ? data : getGameState());
}

function loadGameState() {
    const savedState = JSON.parse(localStorage.getItem('hexGameState'));
    if (savedState) {
        board = savedState.board;
        past_moves = savedState.past_moves;
        playerColor = savedState.playerColor;
        multiplayer = savedState.multiplayer;
        active = savedState.active;
    }
}

function exportGameData() {
    alert("Here is the game data:\n" + getGameState());
}

function importGameData() {
    let data = prompt("Paste game data here:")
    console.log(data)
    saveGameState(data);
    console.log(getGameState())
    loadGameState();
    draw(board, playerColor, selected, ctx);
    handleWinCheck();
}

function mouseDown(event) {
    getSelected(event);
    if (active) {
        if (selected[0] != -1 && selected[1] != -1) {
            past_moves.push([selected[0], selected[1], playerColor]);
            board[selected[0]][selected[1]] = playerColor;
            if (multiplayer)
                playerColor = oppositeColor(playerColor);
            else
                botMove(monteCarloTreeSearch, board, past_moves, playerColor);
            draw(board, playerColor, selected, ctx);
            handleWinCheck();
        }
    }
    saveGameState();
}

function mouseMove(event) {
    getSelected(event);
    if (active)
        draw(board, playerColor, selected, ctx);
}

function init() {
    board = new Array(14);
    for (var i = 0; i < 14; i++) {
        board[i] = new Array(14);
        for (var j = 0; j < 14; j++)
            board[i][j] = -1;
    }
    past_moves = [];
    active = true;
    draw(board, playerColor, selected, ctx);
}

function load() {
    var canvas = document.getElementById("output");
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    var monteCarloTreeSearch = new MonteCarloTreeSearch()
    canvas.onmousedown = mouseDown;
    canvas.onmousemove = mouseMove;
    init();
    if (localStorage.getItem("hexGameState") === null)
        saveGameState();
    loadGameState();
    document.getElementById("change-mode").checked = multiplayer;
    draw(board, playerColor, selected, ctx);
    handleWinCheck(showAlerts = false);
}