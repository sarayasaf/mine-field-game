'use strict'
// ----------------- gllobal variables -----------------

var gBoard

var gLevel = {
    SIZE: 6, 
    MINES: 4,
}

var gGame = {
    isOn: false, 
    revealedCount: 0, 
    markedCount: 0, 
    secsPassed: 0,
    lives: 3
}

var minesArr = []
var revealedCellsArr = []

var isFirstclick = true



init() //playing the game

// ----------------- RENDER BOARD -----------------

function renderBoard(mat, selector) {
    var strHTML = '<table><tbody>'

    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < mat.length; j++) {
            var cell = mat[i][j]
            var className = `cell cell-${i}-${j}`
            var cellContent = ''

            // הצגת סימון דגל קודמת לכל
            if (cell.isMarked) {
                cellContent = '🚩'
            } else if (cell.isRevealed) {
                className += ' revealed'
                if (cell.isMine) cellContent = '💣'
                else if (cell.minesAroundCount > 0) cellContent = cell.minesAroundCount
            }

            strHTML += `<td class="${className}" 
                 onclick="onCellClicked(${i}, ${j})" 
                 oncontextmenu="onCellMarked(${i}, ${j}); return false;">
                ${cellContent}
            </td>`
        }

        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>'
    document.querySelector(selector).innerHTML = strHTML
}


// ----------------- INIT -----------------

function init(){
    gBoard = buildBoard()
    console.table(gBoard)
    renderBoard(gBoard, '.board-container')  // פה קוראים לפונקציה
    hideYouWinHeading()
    
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
    // placeMines(board)
    // setMinesNegsCount(board)

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

function placeMines(board, firstClickI, firstClickJ) {
    console.log('Starting to place mines...')
    var minesToPlace = gLevel.MINES
    var size = gLevel.SIZE

    while (minesToPlace > 0) {
        var i = getRandomInt(0, size)
        var j = getRandomInt(0, size)

        // אל תשים מוקש על התא הראשון שנלחץ
        if ((i === firstClickI && j === firstClickJ) || board[i][j].isMine) {
            continue
        }

        // הנחה של מוקש במקום מתאים
        board[i][j].isMine = true
        console.log('Placed mine at:', i, j)
        minesArr.push(board[i][j])
        minesToPlace--
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
    gGame.revealedCount++
    revealedCellsArr.push(cell)

    if(isFirstclick){
        isFirstclick = false
        placeMines(gBoard, i,j)
        setMinesNegsCount(gBoard)
        startGame()
    }
    

    if (cell.isMine) {
        alert('BOOM!💥 You clicked on a mine.')
        gGame.lives--
        updateLivesDisplay()
    } 
    if(cell.minesAroundCount === 0){
        expandReveal(gBoard, i, j)
    }

    

    checkGameOver()
    renderBoard(gBoard, '.board-container')
}

// ----------------- onCellMarked -----------------

function onCellMarked( i, j){
    console.log('Right-click on cell:', i, j)
    var cell = gBoard[i][j]

    if(cell.isRevealed && !cell.isMine)return

    if (cell.isRevealed && cell.isMine && gGame.lives <= 0) return

    cell.isMarked = !cell.isMarked
    checkGameOver()
    renderBoard(gBoard, '.board-container')
   

}

// ----------------- game over -----------------

function checkGameOver(){
    console.log('checking game over...')

    if(gGame.lives === 0){
        endGame()
    }

    for(var i = 0; i < minesArr.length; i++){
        var mine = minesArr[i]

        console.log(mine)
        if(!mine.isMarked) return

    }

    checkWin()

}

function checkWin() {
    var revealedCount = 0
    var correctlyMarkedMines = 0

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]

            if (cell.isRevealed && !cell.isMine) revealedCount++
            if (cell.isMine && cell.isMarked) correctlyMarkedMines++
        }
    }

    // console.log('revealedCount:', revealedCount)
    // console.log('correctlyMarkedMines:', correctlyMarkedMines)
    // console.log('total mines:', gLevel.MINES)
    // console.log('total non-mine cells:', gLevel.SIZE * gLevel.SIZE - gLevel.MINES)

    var totalCells = gLevel.SIZE * gLevel.SIZE
    var nonMineCells = totalCells - gLevel.MINES

    if (revealedCount === nonMineCells && correctlyMarkedMines === gLevel.MINES) {
        console.log('you win!')
        showYouWinHeading()
        return true
    }

    return false
}


// ----------------- expand reveal -----------------

function expandReveal(board, rowIdx, colIdx) {


    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if (i < 0 || i >= board.length) continue

        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            var neighbor = board[i][j]

            if(neighbor.isRevealed || neighbor.isMarked || neighbor.isMine) continue
            onCellClicked(i,j)
            // neighbor.isRevealed = true
            // gGame.revealedCount++
            // revealedCellsArr.push(neighbor)

        }
       
    }

}

// ----------------- update lives -----------------

function updateLivesDisplay(){

    const elLives = document.querySelector('#lives-count')
    elLives.innerText = '❤️'.repeat(gGame.lives)
}

// ----------------- end game -----------------

function endGame(){
    gGame.isOn = false
    console.log('gameover!!!')
    var elHeading = document.querySelector('#lives-count')
    elHeading.innerHTML = ''
    showGameOverHeading()
    updateButton()

}

// ----------------- show hide headings -----------------

function showGameOverHeading(){
    console.log('gameover!!!')
    var elHeading = document.querySelector('h3')
    elHeading.classList.remove('hide')

}

function hideGameOverHeading(){
    console.log('gameover!!!')
    var elHeading = document.querySelector('h3')
    elHeading.classList.add('hide')

}

function showYouWinHeading(){
   
    var elHeading = document.querySelector('h3.win')
    elHeading.classList.remove('hide')

}

function hideYouWinHeading(){
    
    var elHeading = document.querySelector('h3.win')
    elHeading.classList.add('hide')

}

// ----------------- restart game -----------------

function restartGame(){
    console.log('game restarted')

    gGame.isOn = false
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.lives = 3
    isFirstclick = true

    minesArr = []
    revealedCellsArr = []

    hideGameOverHeading()
    updateLivesDisplay()
    updateButton()
    init()

}

// ----------------- update button -----------------

function updateButton() {
    const elEmoji = document.getElementById('game-emoji') 
    if (!elEmoji) return

    if (gGame.isOn) {
        elEmoji.innerText = '😊'
    } else if (gGame.lives === 0) {
        elEmoji.innerText = '😵'
    } else {
        elEmoji.innerText = '😊' 
    }
}



var gIsHintActive = false
var gUsedHints = 0
const gTotalHints = 3

function onHintClick(elHint) {
  if (gIsHintActive || elHint.classList.contains('used')) return
  gIsHintActive = true
  elHint.classList.add('active')
}
