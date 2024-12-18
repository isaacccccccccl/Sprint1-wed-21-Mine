'use strict'




const EMPTY = ''
const MINE = '🧨'
const FLAG = '🚩'
const FULLLIFE = '❤❤❤'
const TWOLIFE = '❤❤'
const ONELIFE = '❤'
const WINSMILE = '😎'
const PLAYSMILE = '😁'
const LOSESMILE = '☹'


// The model 
const gLevel = {
    SIZE: 4,
    MINES: 2
}

const gCell = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: false

}

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoardObject
var gBoardRender

var gEmptyCell
var gNegs
var gFlagCount
var gLifeCount
var gStopGame

var gTimerInterval
var gStartTime


// create a 4X4 matrix


function onInitGame() {
    // delete content of mouse
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    })

    gStopGame = false
    gEmptyCell = (gLevel.SIZE ** 2) - gLevel.MINES
    gLifeCount = 3
    gFlagCount = 0

    //render life and mine cell
    renderLifeCell(gLifeCount)
    renderMineCell()
    // create two boards 1 is with objects the second is with shapes for render

    buildBoard()
    renderBoard(gBoardRender)

    console.table(gBoardObject)
    console.table(gBoardRender)
}

function buildBoard() {
    gBoardObject = createGboard(gLevel.SIZE, gLevel.SIZE)
    gBoardRender = createBoard(gLevel.SIZE, gLevel.SIZE)
}


function onCellClicked(ev, onBtn, i, j) {
    if (gGame.isOn) {
        if (ev.button === 2 && gBoardRender[i][j] !== FLAG && gBoardObject[i][j].isShown !== true) {
            updateBoard(i, j, true, FLAG)
            checkGameStatus(i, j, ev.button, onBtn)
            gFlagCount++
            renderMineCell()
        } else if (ev.button === 2 && gBoardRender[i][j] === FLAG) {
            if (gBoardObject[i][j].isMine === true) gGame.markedCount--
            updateBoard(i, j, false, EMPTY)
            gFlagCount--
            checkGameStatus(i, j, ev.button, onBtn)
            renderMineCell()
        } else if (ev.button === 0 && gBoardObject[i][j].isShown !== true) {
            onBtn.classList.remove('hide')
            findAndShowNegs(i, j)
            checkGameStatus(i, j, ev.button, onBtn)
        }

    } else if (ev.button === 0 && !gStopGame) {
        {
            startGame(i, j)
            console.table(gBoardObject)
            console.table(gBoardRender)
        }
    }
}

function startGame(i, j) {
    startTimer()
    gStopGame = true
    gGame.isOn = true

    randomMines(gLevel.MINES, i, j)
    renderBoard(gBoardRender)

    var elFirst = document.querySelector(`.cell-${i}-${j}`)
    elFirst.classList.remove('hide')

    findNegs()
    findAndShowNegs(i, j)
}

function updateBoard(i, j, isTrue, value) {
    gBoardObject[i][j].isShown = isTrue
    gBoardObject[i][j].isMarked = isTrue
    gBoardRender[i][j] = value
    renderCell({ i, j }, value)
}

function findNegs() {
    for (var i = 0; i < gBoardObject.length; i++) {
        for (var j = 0; j < gBoardObject[0].length; j++) {
            var currNegsCount = countNegs(i, j, gBoardObject)
            if (currNegsCount === null) {
                gBoardObject[i][j].minesAroundCount = MINE
                gBoardRender[i][j] = MINE

            } else if (currNegsCount === 0) {
                gBoardObject[i][j].minesAroundCount = currNegsCount
                gBoardRender[i][j] = EMPTY

            } else {
                gBoardObject[i][j].minesAroundCount = currNegsCount
                gBoardRender[i][j] = currNegsCount

            }
        }
    }
}

function findAndShowNegs(i, j) {
    var currNegsCount = countNegs(i, j, gBoardObject)
    if (currNegsCount === null) {
        renderCell({ i, j }, MINE)
    } else if (currNegsCount === 0) {
        renderCell({ i, j }, EMPTY)
        gEmptyCell--
        minesAroundCount()
    } else {
        renderCell({ i, j }, currNegsCount)
        gEmptyCell--
    }
    gBoardObject[i][j].isShown = true
}

function minesAroundCount() {
    for (var i = 0; i < gNegs.length; i++) {
        var elcell = document.querySelector(`.cell-${gNegs[i].i}-${gNegs[i].j}`)
        elcell.classList.remove('hide')
        renderCell(gNegs[i], gBoardRender[gNegs[i].i][gNegs[i].j])
        gBoardObject[gNegs[i].i][gNegs[i].j].isShown = true
        gEmptyCell--
    }
}

function randomMines(amount, celli, cellj) {

    var allEmptyCells = emptyCells()
    // console.log(allEmptyCells)


    for (var i = 0; i < amount; i++) {
        var randIdx = getRandomInt(0, allEmptyCells.length)
        console.log('cell', allEmptyCells[randIdx].i, allEmptyCells[randIdx].i)

        if (allEmptyCells[randIdx].i === celli && allEmptyCells[randIdx].j === cellj) {
            var deletedCell = allEmptyCells.splice(randIdx, 1)
            i--
            console.log(deletedCell)
            continue
        }
        gBoardObject[allEmptyCells[randIdx].i][allEmptyCells[randIdx].j].isMine = true
        gBoardRender[allEmptyCells[randIdx].i][allEmptyCells[randIdx].j] = MINE
        allEmptyCells.splice(randIdx, 1)
    }

}


function setGameSize(elBtn) {
    if (elBtn.innerText === 'Expert') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
    } else if (elBtn.innerText === 'Medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
    } else {
        gLevel.SIZE = 4
        gLevel.MINES = 2
    }
    restartGame()
}


function checkGameStatus(i, j, ev, onBtn) {
    // win all of the flags are mines
    if (gBoardRender[i][j] === FLAG && gBoardObject[i][j].isMine === true) {
        gGame.markedCount++
    }

    if (gGame.markedCount === gLevel.MINES && gEmptyCell === 0) {
        stopTimer()
        showModal(true)
        renderSmile(true)
        gGame.isOn = false
    }

    if (gBoardObject[i][j].isMine === true && gBoardObject[i][j].isMarked === false && ev !== 2) {
        if (gLifeCount > 0) {
            anotherLife(i, j, onBtn)
        } else {
            stopTimer()
            showModal(false)
            renderSmile(false)
            gGame.isOn = false
        }
    }
}

function anotherLife(i, j, onBtn) {
    gLifeCount--
    gGame.markedCount--
    gBoardObject[i][j].isShown = false
    gBoardRender[i][j] = gBoardObject[i][j].minesAroundCount
    renderLifeCell(gLifeCount)
    renderCell({ i, j }, MINE)
    setTimeout(renderCell, 3000, { i, j }, EMPTY)
    onBtn.classList.add('hide')
}

function restartGame() {
    stopTimer()
    gStopGame = false
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0

    var elSmile = document.querySelector('.show-table .smile')
    elSmile.innerText = PLAYSMILE

    HideModal()
    onInitGame()
}

function renderMineCell() {
    var elMine = document.querySelector('.mine')
    elMine.innerText = gLevel.MINES - gFlagCount
}

function renderLifeCell(lifeCount) {
    var elMine = document.querySelector('.life')
    console.log(lifeCount)
    if (lifeCount === 3) {
        elMine.innerText = FULLLIFE
    } else if (lifeCount == 2) {
        elMine.innerText = TWOLIFE
    } else if (lifeCount == 1){
        elMine.innerText = EMPTY
    }
}

function renderSmile(isVectory) {
    var elSmile = document.querySelector('.show-table .smile')
    if (isVectory) elSmile.innerText = WINSMILE
    else elSmile.innerText = LOSESMILE
}



