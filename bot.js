function botMove(board, hist) {
    move = getBotMove(board);
    hist.push([move[0], move[1], 1]);
    board[move[0]][move[1]] = 1;
}

function getBotMove(board) {
    var pos;
    do
        pos = [Math.floor(Math.random() * 14), Math.floor(Math.random() * 14)];
    while (board[pos[0]][pos[1]] != -1);
    return pos;
}