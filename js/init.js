'use strict';
const { gBoard, buildBoard, renderBoard } = require("./main");

// ----------------- INIT -----------------
export function init() {
    gBoard = buildBoard();
    console.table(gBoard);
    renderBoard(gBoard, '.board-container');

}
