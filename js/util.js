'use strict'

function createGboard(rows, cols) {
    const mat = []
    for (var i = 0; i < rows; i++) {
        const row = []
        for (var j = 0; j < cols; j++) {
            row.push({ ...gCell })
        }
        mat.push(row)
    }

    return mat
}
function createBoard(rows, cols) {
    const mat = []
    for (var i = 0; i < rows; i++) {
        const row = []
        for (var j = 0; j < cols; j++) {
            row.push('')
        }
        mat.push(row)
    }

    return mat
}

function renderBoard(mat) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className} hide" data-i="${i}" data-j="${j}" onmousedown="onCellClicked(event,this,${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function countNegs(cellI, cellJ, mat) {
    // console.log('index ', cellI, cellJ)
    
    if (mat[cellI][cellJ].isMine === true) return null
    var count = 0
    gNegs = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine === true) {
                count++
            } else if(mat[i][j].isShown === false) {
                gNegs.push({i,j})
            }
        }
    }
    // console.log('count:', count)
    return count
}

function showModal(isVictory) {
    // console.log('hi modal')
    const victory = 'You Win'
    const notVictory = 'You Lose'
    const msg = (isVictory) ? victory : notVictory

    var elSpan = document.querySelector('.modal span')
    var elModal = document.querySelector('.modal')
    elSpan.innerText = msg

    elModal.style.display = 'block'
    console.log(elModal)
}

function HideModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}


function getRandomColor() {
    const letters = '0123456789ABCDEF'
    var color = '#'

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}


function emptyCells() {

    var emptyCells = []


    for (var i = 1; i < gBoardObject.length - 1; i++) {
        for (var j = 1; j < gBoardObject[0].length - 1; j++) {
            var currCell = gBoardObject[i][j]

            if (currCell.isMine === false) {
                emptyCells.push({ i, j })
            }
        }
    }

    return emptyCells

}


function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}


function addSound() {
    var audio = new Audio('../sound/ball-collected.mp3')
    audio.play()
}

function startTimer(){
    gStartTime = Date.now()
    clearInterval(gTimerInterval)
    gTimerInterval = setInterval(timerTick, 67)
}

function stopTimer(){
    gStartTime = 0
    clearInterval(gTimerInterval)
    document.querySelector('.timer').innerHTML = '00 : 00'
}

function timerTick() {
    var timePassed = Date.now() - gStartTime
    var millisecs = String(timePassed % 1000).padStart(3, '0')
    var secs = parseInt(timePassed / 1000)
    
    var strToDisplay = `${secs} : ${millisecs}`
    document.querySelector('.timer').innerHTML = '' + strToDisplay
}
