class Node {
    constructor(state, parent, color, terminated, moveMade) {
        this.state = state;
        this.color = color; // color means the color of the player that just moved
        this.parent = parent; // null if root
        this.isLeaf = true;
        this.children = [];
        this.simulations = 0;
        this.wins = 0;
        this.remainingSquares =
            parent === null
                ? remainingSquares(state)
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
            return { index:i, value: child.UTC() };
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

    simulate = () => {
        let state = copyState(this.state);
        let color = this.color;
        while (!checkWin(state, color)) {
            let move = randomMove(state);
            color = oppositeColor(color);
            state[move[0]][move[1]] = color;
        }
        return color;
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
        let newState = copyState(this.state);
        let move = randomMove(
            newState,
            this.children.map((child) => {
                return child.moveMade;
            })
        );
        let newColor = oppositeColor(this.color);
        newState[move[0]][move[1]] = newColor;

        let newNode = new Node(
            newState,
            this,
            newColor,
            checkWin(newState, newColor) ? newColor : false,
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

function monteCarloTreeSearch(
    state,
    color,
    searchTime,
    simulationCount,
    expansionCount
) {
    let root = new Node(state, null, color, false, null);
    let end = Date.now() + searchTime * 1000;
    let i = 0;
    while (Date.now() < end) {
        //for (let i = 0; i < iterations; i++) {
        let node = root.chooseLeaf();
        let simulationNode = node.expand(expansionCount);
        for (let j = 0; j < simulationCount; j++) {
            winningColor = simulationNode.simulate();
            simulationNode.backpropogate(winningColor);
        }
        i++;
    }
    console.log(`ran for ${i} iterations`);

    let bestRatio = -1;
    for (let child of root.children) {
        let ratio = child.wins / child.simulations;
        if (ratio > bestRatio) {
            bestRatio = ratio;
            bestChild = child;
        }
    }
    return bestChild.moveMade;
}

function botMove(board, hist, playerColor) {
    move = monteCarloTreeSearch(board, playerColor, 10, 1, 1);
    hist.push([move[0], move[1], 1]);
    board[move[0]][move[1]] = 1;
}

function randomMove(board, blackList = null) {
    const boardLength = board.length;
    var move;
    do {
        move = [
            Math.floor(Math.random() * boardLength),
            Math.floor(Math.random() * boardLength),
        ];
    } while (
        board[move[0]][move[1]] != -1 ||
        (blackList !== null &&
            blackList.some((blackListedMove) => {
                return positionsEqual(blackListedMove, move);
            }))
    );
    return move;
}
