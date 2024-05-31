class Node {
    constructor(state, color) {
        this.state = state;
        this.color = color; // color means the color of the player that just moved
        this.isLeaf = true;
        this.children = [];
        this.simulations = 0;
        this.wins = 0;
        this.terminated = false; // false means no, number means the side that won (since no ties)
    }

    getLeafNodes() {
        let leafNodes = [];
        for (let child of self.children) {
            if (child.terminated)
                continue
            else if (child.isLeaf)
                leafNodes.push(child)
            else
                leafNodes.push(...child.getLeafNodes())
        }
        return leafNodes
    }
}

class MonteCarloTreeSearch {
    search(state, color, iterations) {
        for (let i = 0; i < iterations; i++) {
            let node = Node(state, color);
            for (let leafNode of node.getLeafNodes()) {

            }
        }
    }

    expand(node) {
        let currentNode = node;
        while (!checkWin(currentNode.state, currentNode.color)) {
            let newState = currentNode.state.slice()
            let move = randomMove(currentNode.state)
            newState[move[0]][move[1]] = oppositeColor(node.color)
            let newNode = Node(newState, oppositeColor(node.color))
            currentNode.children.push(newNode)
            currentNode.isLeaf = false
            currentNode = newNode
        }
        currentNode.terminated = currentNode.color;
    }
}

function botMove(monteCarloTreeSearch, board, hist, playerColor) {
    move = monteCarloTreeSearch.search(board, playerColor, 1000)
    getBotMove(board);
    hist.push([move[0], move[1], 1]);
    board[move[0]][move[1]] = 1;
}

function randomMove(board) {
    var move;
    do
        move = [Math.floor(Math.random() * 14), Math.floor(Math.random() * 14)];
    while (board[move[0]][move[1]] != -1);
    return move;
}

function getBotMove(board) {
    
}