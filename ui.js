function getSelected(event) {
    var color = ctx.getImageData(event.clientX - 20, event.clientY, 1, 1).data;
    color[0] -= color[2] == 38 || color[2] == 178 ? 241 : 0;
    color[1] -= color[2] == 178 ? 220 : (color[2] == 38 ? 0 : 140);
    if (color[0] >= 0 && color[0] <= 13 && color[1] >= 0 && color[1] <= 13 && (color[2] == 38 || color[2] == 171 || color[2] == 178))
        selected = [color[0], color[1]];
    else
        selected = [-1, -1];
}

function drawHexagon(color, x, y, radius) {
    color.beginPath();
    color.moveTo(x, y - radius);
    for (var i = 0; i < 6; i++)
        color.lineTo(x + radius * Math.cos(Math.PI * (1.5 + 1 / 3 * i)), y + radius * Math.sin(Math.PI * (1.5 + 1 / 3 * i)));
    color.closePath();
    color.fill();
    color.stroke();
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
}

function draw(board, player, selected, ctx) {
    ctx.clearRect(0, 0, 850, 600);
    ctx.lineWidth = 1;

    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.moveTo(width * 15.65, radius);
    ctx.lineTo(width * 23.5, 24.5 * radius);
    ctx.lineTo(0, radius);
    ctx.lineTo(width * 7.85, 24.5 * radius);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(0, radius);
    ctx.lineTo(width * 15.65, radius);
    ctx.lineTo(width * 7.85, 24.5 * radius);
    ctx.lineTo(width * 23.5, 24.5 * radius);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "white";
    for (var y = 0; y < 14; y++) {
        for (var x = 0; x < 14; x++) {
            if (board[x][y] == 0)
                ctx.fillStyle = RED;
            else if (board[x][y] == 1)
                ctx.fillStyle = BLUE;
            else if (x == selected[0] && y == selected[1])
                ctx.fillStyle = "rgb(" + (x + (player == 0 ? 241 : 0)) + "," + (y + (player == 0 ? 0 : 140)) + "," + (player == 0 ? 38 : 171) + ")"; //player === 0 ? LIGHT_BLUE : LIGHT_RED;
            else
                ctx.fillStyle = "rgb(" + (x + 241) + "," + (y + 220) + ",178)";
            drawHexagon(ctx, (x + y) * width - (y - 4) * (width / 2), (y + 2) * 1.5 * radius, radius);
        }
    }
}