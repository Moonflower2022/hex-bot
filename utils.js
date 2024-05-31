function findArr(arr, element) {
    for (var i = 0; i < arr.length; i++)
        if (JSON.stringify(arr[i]) == JSON.stringify(element))
            return i;
    return -1;
}

function colorsEqual(color1, color2) {
    for (let i = 0; i < color1.length; i ++){
        if (color1[i] !== color2[i])
            return false
    }
    return true
}

function oppositeColor(color) {
    return color == 0 ? 1 : 0;
}