importScripts("utils.js", "game.js", "mcts.js");

onmessage = function (message) {
    const workerResult = monteCarloTreeSearch(
        message.data[0],
        message.data[1],
        1,
        1,
        1
    );

    postMessage(workerResult);
};
