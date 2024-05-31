const radius = 20;
const width = radius * Math.sqrt(3);
const RED = "rgb(185,0,39)";
const BLUE = "rgb(0,94,132)"
const B_VALUES = [38, 171, 178, 76, 208]
var ctx;
var selected = [-1, -1];
var board;
var past_moves = [];
var player = 0;
var multiplayer = false;
var active = true;

function getSelected(event) {
    var color = ctx.getImageData(event.clientX - 20, event.clientY, 1, 1).data;
    color[0] -= color[2] == 38 || color[2] == 178 ? 241 : 0;
    color[1] -= color[2] == 178 ? 220 : (color[2] == 38 ? 0 : 140);
    if (color[0] >= 0 && color[0] <= 13 && color[1] >= 0 && color[1] <= 13 && (color[2] == 38 || color[2] == 171 || color[2] == 178))
        selected = [color[0], color[1]];
    else
        selected = [-1, -1];
}

function getConnections(x, y, color, open, closed) {
    var a = [-1, 0, 1, 0, 0, -1, 0, 1, 1, -1, -1, 1];
    var ret = [];
    for (var i = 0; i < 6; i++)
        if (x + a[i * 2] >= 0 && x + a[i * 2] < 14 && y + a[i * 2 + 1] >= 0 && y + a[i * 2 + 1] < 14)
            if (board[x + a[i * 2]][y + a[i * 2 + 1]] == color && findArr(open, [x + a[i * 2], y + a[i * 2 + 1]]) == -1 && findArr(closed, [x + a[i * 2], y + a[i * 2 + 1]]) == -1)
                ret.push([x + a[i * 2], y + a[i * 2 + 1]]);

    return ret;
}

function checkWin(color) {
    var open = [], openPrev = [], closed = [], closedPrev = [];
    for (var a = 0; a < 14; a++) {
        if (board[color == 0 ? a : 0][color == 0 ? 0 : a] == color) {
            open.length = openPrev.length = closed.length = closedPrev.length = 0;
            var pathFound = false;
            open.push([color == 0 ? a : 0, color == 0 ? 0 : a]);
            openPrev.push(-1);
            while (open.length > 0) {
                var u = open[0];
                open.splice(0, 1);
                var uI = openPrev.splice(0, 1);
                closed.push(u);
                closedPrev.push(uI);
                if (u[color == 0 ? 1 : 0] == 13) {
                    pathFound = true;
                    break;
                }
                var connections = getConnections(u[0], u[1], color, open, closed);
                for (var i = 0; i < connections.length; i++) {
                    open.push(connections[i]);
                    openPrev.push(closed.length - 1);
                }
            }
            if (pathFound) {
                var path = [];
                var u = closed.length - 1;
                while (closedPrev[u] != -1) {
                    path.push(closed[u]);
                    u = closedPrev[u];
                }
                path.push([color == 0 ? a : 0, color == 0 ? 0 : a]);
                path.reverse();
                active = false;
                return path;
            }
        }
    }
    return false;
}

function changeMode() {
    multiplayer = !multiplayer;
    player = 0;
    init();
    saveGameState();
    // draw()
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
        player = a[2];
        saveGameState();
        draw();
    }
}

function getGameState() {
    return JSON.stringify({
        board: board,
        past_moves: past_moves,
        player: player,
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
        player = savedState.player;
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
    draw();
    handleWinCheck();
}

function mouseDown(event) {
    getSelected(event);
    if (active) {
        if (selected[0] != -1 && selected[1] != -1) {
            past_moves.push([selected[0], selected[1], player]);
            board[selected[0]][selected[1]] = player;
            if (multiplayer)
                player = player == 0 ? 1 : 0;
            else
                botMove(board, past_moves);
            draw();
            handleWinCheck();
        }
    }
    saveGameState();
}

function mouseMove(event) {
    getSelected(event);
    if (active)
        draw();
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
    draw();
}

function load() {
    var canvas = document.getElementById("output");
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.onmousedown = mouseDown;
    canvas.onmousemove = mouseMove;
    init();
    if (localStorage.getItem("hexGameState") === null)
        saveGameState();
    loadGameState();
    document.getElementById("change-mode").checked = multiplayer;
    draw();
    handleWinCheck(showAlerts = false);
}