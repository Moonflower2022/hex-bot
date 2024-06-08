function findArr(arr, element) {
    for (var i = 0; i < arr.length; i++)
        if (JSON.stringify(arr[i]) == JSON.stringify(element)) return i;
    return -1;
}

function colorsEqual(color1, color2) {
    for (let i = 0; i < color1.length; i++) {
        if (color1[i] !== color2[i]) return false;
    }
    return true;
}

function statesEqual(state1, state2) {
    for (let i = 0; i < state1.length; i++) {
        for (let j = 0; j < state1[i].length; j++) {
            if (state1[i][j] !== state2[j][i]) {
                return false;
            }
        }
    }
    return true;
}

function copyState(state) {
    return JSON.parse(JSON.stringify(state));
}

function oppositeColor(color) {
    return color == 0 ? 1 : 0;
}

function getMove(previousState, state) {
    for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[i].length; j++) {
            if (previousState[i][j] !== state[j][i]) {
                return [i, j];
            }
        }
    }
}

Object.defineProperty(Array.prototype, "random", {
    value() {
        return this[Math.floor(Math.random() * this.length)];
    },
});
