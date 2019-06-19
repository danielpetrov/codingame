import {findFarestBuilding, findNearestBuilding, getInBounderies} from "./utils"

let shouldRunToInitial = true

export const getRunFromKnightsCommand = ({ initialCoordinates, queen, safeFriendlyTowers }) => {
    console.error('run')

    let safeCoordinates = {
        x: initialCoordinates.x,
        y: initialCoordinates.y
    }

    if (!shouldRunToInitial && (Math.abs(queen.x - initialCoordinates.x) > 500 || Math.abs(queen.y - initialCoordinates.y) > 500)) {
        shouldRunToInitial = true
    }

    if (shouldRunToInitial && (Math.abs(queen.x - initialCoordinates.x) > 100 || Math.abs(queen.y - initialCoordinates.y) > 100)) {
        return `MOVE ${safeCoordinates.x} ${safeCoordinates.y}`
    } else {
        shouldRunToInitial = false
    }

    const farestTowerY = safeFriendlyTowers.reduce((acc, building) => {
        if (Math.abs(building.y - queen.y) > acc.y) {
            acc = building
        }

        return acc
    }, { y: 0 })

    if (farestTowerY.id !== undefined) {
        safeCoordinates = {
            x: farestTowerY.x,
            y: farestTowerY.y
        }
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