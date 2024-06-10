class Node {
    constructor(parent, color, terminated, moveMade, remainingSquares) {
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

class MonteCarloTreeSearch {
    constructor(boardLength, pastMoves) {
        this.boardLength = boardLength;
        this.pastMoves = pastMoves;
        this.winChecker = new WinChecker(boardLength, pastMoves);
    }

    run = (color, searchSeconds, simulationCount) => {
        let root = new Node(
            null,
            color,
            false,
            null,
            boardLength * boardLength - this.pastMoves.length
        );
        let end = Date.now() + searchSeconds * 1000;
        let i = 0;
        while (Date.now() < end) {
            const node = root.chooseLeaf();
            const simulationNode = this.addChild(node)
            for (let j = 0; j < simulationCount; j++) {
                this.rollOut(simulationNode)
            }
            this.winChecker.reset()
            i++;
        }
        console.log(`ran for ${i} iterations`);

        root.children.sort((a, b) => {
            return b.wins / b.simulations - a.wins / a.simulations;
        });
        return root.children[0].moveMade;
    };

    addChild = (node) => {
        if (node.terminated) {
            return node;
        }
        const newColor = oppositeColor(node.color)
        const move = this.winChecker.randomMove(newColor);
        let simulationNode = new Node(
            node,
            newColor,
            this.winChecker.terminated,
            move,
            null
        );
        node.children.push(simulationNode);
        node.isLeaf = false;
        return simulationNode;
    };

    rollOut = (node) => {
        let color = node.color
        while (this.winChecker.result === false) {
            color = oppositeColor(color)
            this.winChecker.randomMove(color);
        }
        node.backpropogate(this.winChecker.result);
    }
}

function botMove(board, pastMoves, playerColor) {
    const treeSearcher = new MonteCarloTreeSearch(board.length, pastMoves)
    const move = treeSearcher.run(playerColor, 1, 1);
    pastMoves.push([move[0], move[1], 1]);
    board[move[0]][move[1]] = 1;
}
