function elementsEqual(x, y) {
    return x[0] === y[0] && x[1] === y[1];
}

function copyElement(x) {
    return [...x];
}

function generateCells(n) {
    const cells = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            cells.push([i, j]);
        }
    }
    return cells;
}

class DisjointSet {
    constructor(elements) {
        this.parents = {};
        this.sizes = {}; // the # of members in subset (index is representative)
        for (let element of elements) {
            this.makeSet(element);
        }
    }

    makeSet(x) {
        this.parents[x] = x;
        this.sizes[x] = 1;
    }

    findRepresentative(x) {
        if (elementsEqual(this.parents[x], x)) {
            return x;
        } else {
            return this.findRepresentative(this.parents[x]);
        }
    }

    areInSameSet(x, y) {
        return elementsEqual(
            this.findRepresentative(x),
            this.findRepresentative(y)
        );
    }

    union(x, y) {
        const xRepresentative = this.findRepresentative(x);
        const yRepresentative = this.findRepresentative(y);

        if (!elementsEqual(xRepresentative, yRepresentative)) {
            if (this.sizes[xRepresentative] > this.sizes[yRepresentative]) {
                this.parents[yRepresentative] = copyElement(xRepresentative);
                this.sizes[xRepresentative] += this.sizes[yRepresentative];

                delete this.sizes[yRepresentative];
            } else {
                this.parents[xRepresentative] = copyElement(yRepresentative);
                this.sizes[yRepresentative] += this.sizes[xRepresentative];

                delete this.sizes[xRepresentative];
            }
        }
    }
}

class WinChecker {
    constructor(boardLength, pastMoves) {
        this.board = initBoard(boardLength);

        const cells = generateCells(boardLength);
        this.leftHex = [-1, 0];
        this.rightHex = [boardLength, 0];
        this.topHex = [0, -1];
        this.bottomHex = [0, boardLength];

        this.redDisjointSet = new DisjointSet([
            ...cells,
            this.leftHex,
            this.rightHex,
        ]);
        this.blueDisjointSet = new DisjointSet([
            ...cells,
            this.topHex,
            this.bottomHex,
        ]);
        for (let i = 0; i < boardLength; i++) {
            this.blueDisjointSet.union([0, i], this.topHex);
            this.blueDisjointSet.union([boardLength - 1, i], this.bottomHex);
            this.redDisjointSet.union([i, 0], this.leftHex);
            this.redDisjointSet.union([i, boardLength - 1], this.rightHex);
        }
        this.applyHistory(pastMoves);
    }

    applyHistory = (pastMoves) => {
        for (const move of pastMoves) {
            this.move(...move);
        }
    };

    move = (x, y, color) => {
        this.board[x][y] = color;

        const neighbors = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [1, -1],
            [-1, 1],
        ];

        for (const [dx, dy] of neighbors) {
            const [nx, ny] = [x + dx, y + dy];
            if (isInBoard(nx, ny, this.board.length) && this.board[nx][ny] === color) {
                if (color === 0) {
                    this.redDisjointSet.union([x, y], [nx, ny]);
                    if (
                        this.redDisjointSet.areInSameSet(
                            this.leftHex,
                            this.rightHex
                        )
                    ) {
                        this.result = 0;
                        return;
                    }
                } else {
                    this.blueDisjointSet.union([x, y], [nx, ny]);
                    if (
                        this.blueDisjointSet.areInSameSet(
                            this.topHex,
                            this.bottomHex
                        )
                    ) {
                        this.result = 1;
                        return;
                    }
                }
            }
        }
        this.result = false;
    };

    randomMove = (color, blackList = null) => {
        var move;
        do {
            move = [
                Math.floor(Math.random() * this.boardLength),
                Math.floor(Math.random() * this.boardLength),
            ];
        } while (
            this.board[move[0]][move[1]] != -1 ||
            (blackList !== null &&
                blackList.some((blackListedMove) => {
                    return positionsEqual(blackListedMove, move);
                }))
        );
        this.move(...move, color);
    };
}

function checkWin(board, color) {
    const pastMoves = getPastMoves(board);

    let checker = new WinChecker(board.length, pastMoves);
    return checker.result;
}