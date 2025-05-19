'use strict'
// ----------------- gllobal variables -----------------

var gBoard

var gLevel = {
    SIZE: 4, 
    MINES: 2
}

var gGame = {
    isOn: false, 
    revealedCount: 0, 
    markedCount: 0, 
    secsPassed: 0
}

var minesArr = []
var revealedCellsArr = []

init() //playing the game

// ----------------- RENDER BOARD -----------------

function renderBoard(mat, selector){
    var strHTML = '<table><tbody>'

    for(var i = 0; i < mat.length; i++){
        strHTML += '<tr>'

        for(var j = 0; j < mat.length; j++){
            var cell = mat[i][j]
            var className = `cell cell-${i}-${j}`
            var cellContent = ''

            if(cell.isRevealed) {
                className += ' revealed'
                if(cell.isMine) cellContent = '💣'
                else if (cell.minesAroundCount > 0) cellContent = cell.minesAroundCount
            } else if(cell.isMarked) {
                cellContent = '🚩'
            }

            strHTML += `<td class="${className}" 
                 onclick="onCellClicked(${i}, ${j})" 
                 oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;">
                ${cellContent}
            </td>`
        }

        strHTML += '</tr>'  // חשוב! לסגור את השורה
    }

    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// ----------------- INIT -----------------

function init(){
    gBoard = buildBoard()
    console.table(gBoard)
    renderBoard(gBoard, '.board-container')  // פה קוראים לפונקציה
}

// ----------------- BUILD BOARD -----------------

function buildBoard(){
    const size = gLevel.SIZE
    const board = []

    //create cells:
    for(var i = 0; i < size; i++){
        board.push([])

        for(var j = 0; j < size; j++){
            board[i][j] = createCell()
        }
    }

   //spread some mines
   // Set minesAroundCount for each cell
    placeMines(board)
    setMinesNegsCount(board)

    return board
}


// ----------------- CREATE CELL -----------------

function createCell() {
    var cell = { 
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false
        }

    return cell 
}

// ----------------- PLACE MINES -----------------

function placeMines(board){

    console.log('Starting to place mines...')
    var minesToPlace = gLevel.MINES
    var size = gLevel.SIZE
    

    while(minesToPlace > 0) {
        var i = getRandomInt(0, size)
        var j = getRandomInt(0, size)

    //change cell mine to true:
    if(!board[i][j].isMine){
        board[i][j].isMine = true
        console.log('Placed mine at:', i, j)
        minesArr.push(board[i][j])
        minesToPlace--
    }
  }
}

// ----------------- SET MINES AROUND COUNT -----------------

function setMinesNegsCount(board){
    for(var i = 0; i < board.length; i ++ ){
        for(var j = 0; j < board.length; j++){
            board[i][j].minesAroundCount = countNegMines(board, i, j)
        }
    }
}

function countNegMines(board, rowIdx, colIdx) {
    var count = 0

    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if (i < 0 || i >= board.length) continue

        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            if (board[i][j].isMine) count++
            
        }
    }
    return count
}

// ----------------- START GAME -----------------

function startGame(){
    gGame.isOn = true
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0

    console.log('game started')
}

// ----------------- HELPER -----------------

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

// ----------------- HANDLE CELL CLICK -----------------

function onCellClicked(i, j) {
    const cell = gBoard[i][j]

    if (cell.isRevealed || cell.isMarked) return
    cell.isRevealed = true
    revealedCellsArr.push(cell)
   


    if (cell.isMine) {
        alert('BOOM!💥 You clicked on a mine.')
        gGame.isOn = false
    }

    checkGameOver()
    renderBoard(gBoard, '.board-container')
}

// ----------------- onCellMarked -----------------

function onCellMarked(elCell,  i, j){
    console.log('Right-click on cell:', i, j)
    var cell = gBoard[i][j]

    if(cell.isRevealed)return
    cell.isMarked = !cell.isMarked
    checkGameOver()
    renderBoard(gBoard, '.board-container')

}

// ----------------- game over -----------------

function checkGameOver(){
    console.log('checking game over...')

    for(var i = 0; i < minesArr.length; i++){
        var mine = minesArr[i]

        console.log(mine)
        if(!mine.isMarked) return

    }

    if(revealedCellsArr.length === (gLevel.SIZE*gLevel.SIZE - gLevel.MINES)){
        console.log('you win!')
    }
       

}

