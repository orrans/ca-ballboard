'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const ICE = 'ICE'
const FROZEN = 'FROZEN'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const ICE_IMG = '<img src="img/ice.png">'
const FROZEN_IMG = '<img src="img/gamer-frozen.png">'

// Model:
var gBoard
var gGamerPos
var gBallPos
var gBallsCount = 0
var gBallsNearMe = 0
var isFrozen = false
var gBallInterval = null
var gIceInterval = null

function initGame() {
    const rows = 11
    const colls = 13

    clearInterval(gBallInterval)
    clearInterval(gIceInterval)

    gBallsCount = 0
    gBallsNearMe = 0
    isFrozen = false

    document.querySelector('.balls-collected').innerText = gBallsCount
    document.querySelector('.balls-near').innerText = gBallsNearMe

    const elRestartBtn = document.querySelector('.restart')
    elRestartBtn.classList.add('hidden')

    gBoard = buildBoard(rows, colls)

    const pos = getRandomFloorPos(gBoard)
    gGamerPos = { i: pos.i, j: pos.j }
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER

    renderBoard(gBoard)
    addBall(gBoard)
    cellFreeze(gBoard)
}

function getRandomFloorPos(board) {
    let i, j
    do {
        i = getRandomNum(0, board.length - 1)
        j = getRandomNum(0, board[0].length - 1)
    } while (board[i][j].type !== FLOOR || board[i][j].gameElement)
    return { i, j }
}

function placeRandomBall(board) {
    const rows = board.length
    const cols = board[0].length
    let i, j

    do {
        i = getRandomNum(0, rows - 1)
        j = getRandomNum(0, cols - 1)
    } while (board[i][j].type === WALL || board[i][j].gameElement !== null)

    board[i][j].gameElement = BALL
    renderBoard(board)
    ballsNearMe(board, gGamerPos.i, gGamerPos.j)
}

function addBall(board) {
    placeRandomBall(board)

    gBallInterval = setInterval(() => {
        if (countBalls(board) >= 10) return
        placeRandomBall(board)
    }, 3000)
}

function countBalls(board) {
    var count = 0
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].gameElement === BALL) count++
        }
    }
    return count
}

function cellFreeze(board) {
    var rows = board.length
    var cols = board[0].length
    var prevCell

    gIceInterval = setInterval(() => {
        var i
        var j
        if (prevCell) prevCell.gameElement = null

        do {
            i = getRandomNum(0, rows - 1)
            j = getRandomNum(0, cols - 1)
        } while (
            board[i][j].type === WALL ||
            (board[i][j].gameElement !== null && board[i][j].gameElement !== GAMER)
        )

        if (i === gGamerPos.i && j === gGamerPos.j) {
            isFrozen = true
            board[i][j].gameElement = FROZEN
            renderBoard(board)

            setTimeout(() => {
                isFrozen = false
                board[i][j].gameElement = GAMER
                renderBoard(board)
            }, 3000)
            return
        }

        board[i][j].gameElement = ICE
        prevCell = board[i][j]
        renderBoard(board)
    }, 5000)
}

function buildBoard(rows, colls) {
    const board = createMat(rows, colls)

    // TODO: Put FLOOR everywhere and WALL at edges

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }

            if (i === 0 || i === board.length - 1 || j === 0 || j === board[i].length - 1) {
                if (i === (board.length - 1) / 2 || j === (board[i].length - 1) / 2) {
                    continue
                }
                board[i][j].type = WALL
            }
        }
    }
    // TODO: Place the gamer and two balls
    // console.log(board)
    return board
}

function ballsNearMe(board, rowIdx, colIdx) {
    gBallsNearMe = 0
    const elBallsNearMe = document.querySelector('.balls-near')
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            // console.log(board[i][j])
            if (board[i][j].gameElement === BALL) gBallsNearMe++
        }
    }
    elBallsNearMe.innerText = gBallsNearMe
}

// Render the board to an HTML table
function renderBoard(board) {
    const elBoard = document.querySelector('.board')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            // strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n'
            strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            } else if (currCell.gameElement === ICE) {
                strHTML += ICE_IMG
            } else if (currCell.gameElement === FROZEN) {
                strHTML += FROZEN_IMG
            }

            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    // console.log('strHTML is:')
    // console.log(strHTML)
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if (isFrozen) return
    // const fromCell = gBoard[gGamerPos.i][gGamerPos.j]
    var isSecretPath = false
    if (j < 0) {
        j = gBoard[0].length - 1
        isSecretPath = true
    } else if (j > gBoard[0].length - 1) {
        j = 0
        isSecretPath = true
    }

    if (i < 0) {
        i = gBoard.length - 1
        isSecretPath = true
    } else if (i > gBoard.length - 1) {
        i = 0
        isSecretPath = true
    }
    var toCell = gBoard[i][j]

    if (toCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    // If the clicked Cell is not one of the four allowed - exit
    if (iAbsDiff + jAbsDiff !== 1 && !isSecretPath) {
        console.log('TOO FAR', iAbsDiff, jAbsDiff)
        return
    }

    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    renderCell(gGamerPos, '')

    if (toCell.gameElement === ICE) {
        isFrozen = true
        gBoard[i][j].gameElement = FROZEN
        gGamerPos = { i, j }
        renderBoard(gBoard)

        setTimeout(() => {
            isFrozen = false
            if (gBoard[i][j].gameElement === FROZEN) {
                gBoard[i][j].gameElement = GAMER
            }
            gGamerPos = { i, j }
            renderBoard(gBoard)
        }, 3000)
        return
    }
    if (toCell.gameElement === BALL) {
        gBallsCount++
        const elBallsCollected = document.querySelector('.balls-collected')
        elBallsCollected.innerText = gBallsCount
    }

    // TODO: Move the gamer
    // Origin model
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null

    // Origin DOM
    renderCell(gGamerPos, '')

    // Destination model
    // Update model and DOM
    gBoard[i][j].gameElement = GAMER
    gGamerPos = { i, j }
    // Destination DOM
    renderCell(gGamerPos, GAMER_IMG)
    ballsNearMe(gBoard, i, j)
    if (countBalls(gBoard) === 0) gameOver()
}

function gameOver() {
    const elRestartBtn = document.querySelector('.restart')
    elRestartBtn.classList.remove('hidden')
    clearInterval(gBallInterval)
    clearInterval(gIceInterval)
    isFrozen = true
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

// Move the player by keyboard arrows
function handleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(position) {
    const cellClass = `cell-${position.i}-${position.j}`
    return cellClass
}
