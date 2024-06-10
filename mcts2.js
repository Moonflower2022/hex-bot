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
        this.board = this.makeBoard(boardLength, pastMoves);
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
        for (let i = 0; i < n; i++) {
            this.blueDisjointSet.union([0, i], this.leftHex);
            this.blueDisjointSet.union([boardLength - 1, i], this.rightHex);
            this.redDisjointSet.union([i, 0], this.topHex);
            this.redDisjointSet.union([i, boardLength - 1], this.bottomHex);
        }
    }

    makeBoard = (boardLength, pastMoves) => {
        board = initBoard(boardLength);
        for (const [x, y, color] of pastMoves) {
            board[x][y] = color;
        }
        return board;
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
            if (isInBoard(nx, ny) && board[nx][ny] === color) {
                if (color === 0) {
                    this.redDisjointSet.union([x, y], [nx, ny]);
                    if (
                        this.redDisjointSet.areInSameSet(
                            this.leftHex,
                            this.rightHex
                        )
                    ) {
                        return 0;
                    }
                } else {
                    this.blueDisjointSet.union([x, y], [nx, ny]);
                    if (
                        this.blueDisjointSet.areInSameSet(
                            this.topHex,
                            this.bottomHex
                        )
                    ) {
                        return 1;
                    }
                }
            }
        }
        return false;
    };

    randomMove = (color, blackList = null) => {
        var move;
        do {
            move = [
                Math.floor(Math.random() * this.boardLength),
                Math.floor(Math.random() * this.boardLength),
            ];
        } while (
            board[move[0]][move[1]] != -1 ||
            (blackList !== null &&
                blackList.some((blackListedMove) => {
                    return positionsEqual(blackListedMove, move);
                }))
        );
        this.move(...move, color);
    };
}

class Node {
    constructor(parent, color, terminated, moveMade, remainingSquares = null) {
        this.color = color; // color means the color of the player that just moved
        this.parent = parent; // null if root
        this.isLeaf = true;
        this.children = [];
        this.simulations = 0;
        this.wins = 0;
        this.remainingSquares =
            parent === null
                ? remainingSquares
                : this.parent.remainingSquares - 1;
        this.terminated = terminated; // false means no, number means the side that won (since no ties)
        this.moveMade = moveMade;
    }

    isFullyExpanded = () => {
        return this.remainingSquares === this.children.length;
    };

    chooseLeaf = () => {
        let currentNode = this;

        while (!currentNode.isLeaf && currentNode.isFullyExpanded()) {
            currentNode = currentNode.bestUTC();
        }

        return currentNode;
    };

    bestUTC = () => {
        const scores = this.children.map((child, i) => {
            return { index: i, value: child.UTC() };
        });

        let bestScore = 0;
        let bestIndex;
        for (let score of scores) {
            if (score.value > bestScore) {
                bestScore = score.value;
                bestIndex = score.index;
            }
        }
        return this.children[bestIndex];
    };

    UTC = () => {
        if (this.simulations === 0) {
            return 1000000;
        }
        const ratio = this.wins / this.simulations;
        const constant = Math.sqrt(2);
        const bonus = Math.sqrt(
            Math.log(this.parent.simulations) / this.simulations
        );
        return ratio + constant * bonus;
    };

    expand = (expansionCount) => {
        if (this.terminated !== false) {
            return this;
        } else {
            for (let i = 0; i < expansionCount; i++) {
                this.addChild();
            }
            return this.children.random();
        }
    };

    addChild = () => {
        let move = randomMove(
            newState,
            this.children.map((child) => {
                return child.moveMade;
            })
        );
        let newColor = oppositeColor(this.color);

        let newNode = new Node(
            this,
            newColor,
            checkWinPath(newState, newColor) ? newColor : false,
            move
        );
        this.children.push(newNode);
        this.isLeaf = false;
    };

    backpropogate(result) {
        this.simulations++;
        if (this.color === result) {
            this.wins++;
        }
        if (this.parent) {
            this.parent.backpropogate(result);
        }
    }
}

class MCTS {
    constructor(board, color, pastMoves) {
        this.boardLength = board.length;
        this.pastMoves = pastMoves;
        this.root = new Node(null, color, false, null, this.boardLength * this.boardLength - pastMoves.length);
    }

    run = (searchSeconds, expansionCount, simulationCount) => {
        let end = Date.now() + searchSeconds * 1000;
        let i = 0;
        while (Date.now() < end) {
            let node = this.root.chooseLeaf();
            let simulationNode = node.expand(expansionCount);
            for (let j = 0; j < simulationCount; j++) {
                this.rollOut(simulationNode);
            }
            i++;
        }
        console.log(`ran for ${i} iterations`);

        root.children.sort((a, b) => {return b.wins / b.simulations - a.wins / a.simulations})
        return root.children[0].moveMade;
    };

    movesMade = (node) => {
        if (node.parent) {
            return [node.moveMade].concat(this.movesMade(node.parent));
        } else {
            return [node.moveMade];
        }
    };

    rollOut = (node) => {
        let winChecker = new WinChecker(
            this.boardLength,
            this.pastMoves.concat(this.movesMade(node))
        );

        let result;
        do {
            result = winChecker.randomMove(node.color);
        } while (result === false);
        node.backpropogate(result);
    };
}

function botMove(board, pastMoves, playerColor) {
    let searcher = new MCTS(board, playerColor, pastMoves);
    move = searcher.run(1, 1, 1)
    hist.push([move[0], move[1], 1]);
    board[move[0]][move[1]] = 1;
}