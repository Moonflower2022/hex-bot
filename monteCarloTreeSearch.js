class Node {
    constructor(state, parent, color, terminated) {
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
                : this.parent.remainingsquares - 1;
        this.terminated = terminated; // false means no, number means the side that won (since no ties)
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
        this.children.sort((node1, node2) => {
            return node2.evaluate() - node1.evaluate();
        });

        return this.children[0];
    };

    evaluate = () => {
        if (!this.isLeaf) {
            throw new Error("evaluating a non leaf node");
        }
        let ratio = this.wins / this.simulations;
        let constant = Math.sqrt(2);
        let bonus = Math.sqrt(
            Math.log(this.parent.simulations) / this.simulations
        );
        return ratio + constant * bonus;
    };

    simulate = () => {
        let state = copyState(this.state);
        let color = this.color;
        while (!checkWin(state, color)) {
            let move = randomMove(state);
            state[move[0]][move[1]] = oppositeColor(color);
            color = oppositeColor(color);
        }
        return color;
    };

    expand = (expansionCount) => {
        if (this.terminated !== false) {
            console.log("warning: expanding terminated node, returning this");
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
        let move = randomMove(newState);
        let newColor = oppositeColor(this.color);
        newState[move[0]][move[1]] = newColor;

        this.children.forEach((node) => {
            if (!statesEqual(node.state, newState)) return;
        });
        let newNode = new Node(
            newState,
            this,
            newColor,
            checkWin(newState, newColor) ? newColor : false
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
    iterations,
    simulationCount,
    expansionCount
) {
    let root = new Node(state, null, color, false);
    for (let i = 0; i < iterations; i++) {
        let node = root.chooseLeaf();
        let simulationNode = node.expand(expansionCount);
        for (let j = 0; j < simulationCount; j++) {
            winningColor = simulationNode.simulate();
            simulationNode.backpropogate(winningColor);
        }
    }

    let bestRatio = -1;
    for (let child of root.children) {
        let ratio = child.wins / child.simulations;
        if (ratio > bestRatio) {
            bestRatio = ratio;
            bestState = child.state;
        }
    }
    console.log(root)
    return getMove(state, bestState);
}

function botMove(board, hist, playerColor) {
    move = monteCarloTreeSearch(board, playerColor, 1000, 1, 1);
    hist.push([move[0], move[1], 1]);
    board[move[0]][move[1]] = 1;
}

function randomMove(board) {
    const boardLength = board.length;
    var move;
    do {
        move = [
            Math.floor(Math.random() * boardLength),
            Math.floor(Math.random() * boardLength),
        ];
    }
    while (board[move[0]][move[1]] != -1);
    return move;
}
