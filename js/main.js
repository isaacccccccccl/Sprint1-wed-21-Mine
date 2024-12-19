'use strict'




const EMPTY = ''
const MINE = '🧨'
const FLAG = '🚩'
const LIFE = '❤'
const WINSMILE = '😎'
const PLAYSMILE = '😁'
const LOSESMILE = '☹'
const HINTS = '💡'
const MEGAHINT = '🐱‍🏍'




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
var gHint
var gHintCount
var gCountSafeClick
var gMines

var gMegaHint
var gMegaHintCount

var gTimerInterval
var gStartTime

var gIdxI1
var gIdxJ1
var gIdxI2
var gIdxJ2



function onInitGame() {
    // delete content of mouse
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    })

    gStopGame = false
    gEmptyCell = (gLevel.SIZE ** 2) - gLevel.MINES
    gLifeCount = 3
    gHintCount = 3
    gFlagCount = 0
    gCountSafeClick = 3
    gMegaHintCount = 0

    //render life and mine cell
    renderSafe()
    renderLifeCell()
    renderMineCell()
    renderHint()
    renderMega()
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
        if (gMegaHint) {
            gMegaHintCount++
            if (gMegaHintCount === 1) {
                gIdxI1 = i
                gIdxJ1 = j
              
            } else {
                gMegaHint = false
                gIdxI2 = i
                gIdxJ2 = j
                var area = getArea(gIdxI1, gIdxJ1, gIdxI2, gIdxJ2)
                console.log(area)
                showMegaHint(gBoardObject, area[0], area[1], area[2], area[3])
                setTimeout(hideMegaHint, 1500, gBoardObject, area[0], area[1], area[2], area[3])
            }

        } else {

            if (gHint && gHintCount >= 0) {
                showHint(i, j)
                gHint = false
                setTimeout(hideHint, 1000, i, j)
                return
            }
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
                gBoardObject[i][j].isShown = true
                findAndShowNegs(i, j)
                checkGameStatus(i, j, ev.button, onBtn)
            }
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
    gMines = []


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
        var deleted = allEmptyCells.splice(randIdx, 1)[0]
        gMines.push(deleted)
    }

    // console.log('gmines', gMines)
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

    // console.log('markcount', gGame.markedCount)

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
            rederLose()
            stopTimer()
            showModal(false)
            renderSmile(false)
            gGame.isOn = false
        }
    }
}

function anotherLife(i, j, onBtn) {
    gGame.markedCount--
    if (gGame.markedCount < 0) gGame.markedCount = 0
    gBoardObject[i][j].isShown = false
    gBoardRender[i][j] = gBoardObject[i][j].minesAroundCount
    renderLifeCell()
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
    var mineCell = (gLevel.MINES - gFlagCount > 0) ? gLevel.MINES - gFlagCount : 0
    elMine.innerText = mineCell
}

function renderLifeCell() {
    var elMine = document.querySelector('.life')
    // console.log('lifeCount', lifeCount)
    if (gLifeCount > 0) {
        elMine.innerText = LIFE.repeat(gLifeCount)
        gLifeCount--
    } else {
        elMine.innerText = EMPTY
    }
}

function renderSmile(isVectory) {
    var elSmile = document.querySelector('.show-table .smile')
    if (isVectory) elSmile.innerText = WINSMILE
    else elSmile.innerText = LOSESMILE
}

function hintClicked() {
    if (!gGame.isOn) return
    gHint = true
    renderHint()
}

function showHint(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoardObject.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoardObject[i].length) continue
            if (gBoardObject[i][j].isShown) continue
            renderCell({ i, j }, gBoardRender[i][j])
        }
    }

}

function hideHint(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoardObject.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoardObject[i].length) continue
            if (gBoardObject[i][j].isShown) continue
            renderCell({ i, j }, EMPTY)
        }
    }
}

function renderHint() {
    var elHint = document.querySelector('.hint')
    // console.log('gHint', gHint)
    if (gHintCount >= 0) {
        elHint.innerText = HINTS.repeat(gHintCount)
        gHintCount--
    }
}

// safe click
function safeClick() {
    // find cells that are not shown
    if (gCountSafeClick < 0 || !gGame.isOn) return
    var notShownCells = emptyCells()

    var randIdx = getRandomInt(0, notShownCells.length)

    var elSafeCell = document.querySelector(`.cell-${notShownCells[randIdx].i}-${notShownCells[randIdx].j}`)
    elSafeCell.classList.add('safe')

    setTimeout(() => { elSafeCell.classList.remove('safe') }, 1500)
    renderSafe()

}

function renderSafe() {
    var elSafeBtn = document.querySelector('.safe-click')
    elSafeBtn.innerText = gCountSafeClick
    gCountSafeClick--
}

function rederLose() {
    // use gMines to render the cell with mine and change the color to red
    for (var i = 0; i < gMines.length; i++) {
        renderCell(gMines[i], MINE)
        var elSafeBtn = document.querySelector(`.cell-${gMines[i].i}-${gMines[i].j}`)
        elSafeBtn.classList.add('mine-cell')
    }
}

function megaHint() {
    if (gMegaHintCount > 2 || !gGame.isOn) return
    gMegaHint = true
}

function getArea(idxI1, idxJ1, idxI2, idxJ2) {
    var buttonIStart = (idxI1 < idxI2) ? idxI1 : idxI2
    var buttonIEnd = (idxI1 > idxI2) ? idxI1 : idxI2
    var buttonJStart = (idxJ1 < idxJ2) ? idxJ1 : idxJ2
    var buttonJEnd = (idxJ1 > idxJ2) ? idxJ1 : idxJ2

    return [buttonIStart, buttonIEnd, buttonJStart, buttonJEnd]

}

function showMegaHint(mat, rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd) {
    console.log(rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd)
    for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
        if (i < 0 || i >= gBoardObject.length) continue
        var row = mat[i]
        for (var j = colIdxStart; j <= colIdxEnd; j++) {
            if (j < 0 || j >= gBoardObject[i].length) continue
            if (gBoardObject[i][j].isShown) continue
            renderCell({ i, j }, gBoardRender[i][j])
        }
    }
}

function hideMegaHint(mat, rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd) {
    for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
        if (i < 0 || i >= gBoardObject.length) continue
        var row = mat[i]
        for (var j = colIdxStart; j <= colIdxEnd; j++) {
            if (j < 0 || j >= gBoardObject[i].length) continue
            if (gBoardObject[i][j].isShown) continue
            renderCell({ i, j }, EMPTY)
        }
    }
}

function renderMega() {
    var elMegaHint = document.querySelector('.mega-hint')
    elMegaHint.innerText = MEGAHINT
}