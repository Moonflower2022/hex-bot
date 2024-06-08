function getSelected(event) {
    var color = ctx.getImageData(event.clientX - 50, event.clientY - 50, 1, 1).data;
    color[0] -= color[2] == 38 || color[2] == 178 ? 241 : 0;
    color[1] -= color[2] == 178 ? 220 : (color[2] == 38 ? 0 : 140);
    if (color[0] >= 0 && color[0] <= boardLength - 1 && color[1] >= 0 && color[1] <= boardLength - 1 && (color[2] == 38 || color[2] == 171 || color[2] == 178))
        selected = [color[0], color[1]];
    else
        selected = [-1, -1];
}

function drawHexagon(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y - radius);
    for (var i = 0; i < 6; i++)
        ctx.lineTo(x + radius * Math.cos(Math.PI * (1.5 + 1 / 3 * i)), y + radius * Math.sin(Math.PI * (1.5 + 1 / 3 * i)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawPath(ctx, p) {
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo((p[0][0] + p[0][1]) * width - (p[0][1] - 4) * (width / 2), (p[0][1] + 2) * 1.5 * radius);
    for (var i = 1; i < p.length; i++)
        ctx.lineTo((p[i][0] + p[i][1]) * width - (p[i][1] - 4) * (width / 2), (p[i][1] + 2) * 1.5 * radius);
    ctx.stroke();
}

function handleWinCheck(showAlerts=true) {
    var p0 = checkWin(board, 0), p1 = checkWin(board, 1);
    if (p0 != false) { 
        drawPath(ctx, p0); 
        if (showAlerts) 
            alert((multiplayer ? "The red player" : "You") + " won!"); 
    }
    else if (p1 != false) { 
        drawPath(ctx, p1); 
        if (showAlerts)
            alert((multiplayer ? "The blue player" : "The computer") + " won!"); 
    }
    active = !p0 && !p0;
}

function getDrawCoordinates(i, j, width, radius) {
    return [(i + j) * width - (j - 4) * (width / 2), (j + 2) * 1.5 * radius]
}

function draw(board, player, selected, width, radius, ctx) {
    const boardLength = board.length;
    ctx.clearRect(0, 0, 1000, 700);
    ctx.lineWidth = 1;

    const [left, top] = getDrawCoordinates(0, 0, width, radius);
    const topRight = getDrawCoordinates(boardLength - 1, 0, width, radius)[0]
    const bottomLeft = getDrawCoordinates(0, boardLength - 1, width, radius)[0]
    const [right, bottom] = getDrawCoordinates(boardLength - 1, boardLength - 1, width, radius);

    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.moveTo(topRight + radius * 1.2, top - 2 * radius);
    ctx.lineTo(right + 2 * width, bottom + 2 * radius);
    ctx.lineTo(left - 2 * width, top - 2 * radius);
    ctx.lineTo(bottomLeft - radius * 1.2, bottom + 2 * radius);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(left - 2 * width, top - 2 * radius);
    ctx.lineTo(topRight + radius * 1.2, top - 2 * radius);
    ctx.lineTo(bottomLeft - radius * 1.2, bottom + 2 * radius);
    ctx.lineTo(right + 2 * width, bottom + 2 * radius);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "white";
    for (var j = 0; j < boardLength; j++) {
        for (var i = 0; i < boardLength; i++) {
            if (board[i][j] == 0)
                ctx.fillStyle = RED;
            else if (board[i][j] == 1)
                ctx.fillStyle = BLUE;
            else if (i == selected[0] && j == selected[1])
                ctx.fillStyle = "rgb(" + (i + (player == 0 ? 241 : 0)) + "," + (j + (player == 0 ? 0 : 140)) + "," + (player == 0 ? 38 : 171) + ")"; //player === 0 ? LIGHT_BLUE : LIGHT_RED;
            else
                ctx.fillStyle = "rgb(" + (i + 241) + "," + (j + 220) + ",178)";
            drawHexagon(ctx, ...getDrawCoordinates(i, j, width, radius), radius);
        }
    }
}