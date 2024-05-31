
function getConnections(x, y, board, color, open, closed) {
    var a = [-1, 0, 1, 0, 0, -1, 0, 1, 1, -1, -1, 1];
    var ret = [];
    for (var i = 0; i < 6; i++)
        if (x + a[i * 2] >= 0 && x + a[i * 2] < 14 && y + a[i * 2 + 1] >= 0 && y + a[i * 2 + 1] < 14)
            if (board[x + a[i * 2]][y + a[i * 2 + 1]] == color && findArr(open, [x + a[i * 2], y + a[i * 2 + 1]]) == -1 && findArr(closed, [x + a[i * 2], y + a[i * 2 + 1]]) == -1)
                ret.push([x + a[i * 2], y + a[i * 2 + 1]]);

    return ret;
}

function checkWin(board, color) {
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
                if (u[oppositeColor(color)] == 13) {
                    pathFound = true;
                    break;
                }
                var connections = getConnections(u[0], u[1], board, color, open, closed);
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