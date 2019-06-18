import {getInBounderies} from "./utils"

export const getRunFromKnightsCommand = ({ closestKnightToQueen, queen, safeFriendlyTowers, enemyTowers }) => {
    const safeCoordinates = {
        x: safeFriendlyTowers[0].x,
        y: safeFriendlyTowers[0].y
    }

    return `MOVE ${safeCoordinates.x} ${safeCoordinates.y}`

    // const isQueenAboveKnight = closestKnightToQueen.y - queen.y > 0
    // const isQueenOnTheRightToKnight = queen.x - closestKnightToQueen.x > 0
    // let runningY
    // let runningX
//
    // if (isQueenAboveKnight) {
    //     runningY = queen.y + (queen.y - closestKnightToQueen.y)
    // } else {
    //     runningY = queen.y - (queen.y - closestKnightToQueen.y)
    // }
//
    // if (isQueenOnTheRightToKnight) {
    //     runningX = queen.x + (queen.x - closestKnightToQueen.x)
    // } else {
    //     runningX = queen.x - (queen.x - closestKnightToQueen.x)
    // }
//
    // const { x: bounderiesRunningX, y: bounderiesRunningY } = getInBounderies({ x: runningX, y: runningY })
//
    // return `MOVE ${bounderiesRunningX} ${bounderiesRunningY}`
}