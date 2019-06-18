import {findFarestBuilding, findNearestBuilding, getInBounderies} from "./utils"

export const getRunFromKnightsCommand = ({ closestKnightToQueen, queen, safeFriendlyTowers, enemyTowers, friendlyBarracks }) => {
    const firstBarrack = friendlyBarracks[0]
    let safeCoordinates
    if (firstBarrack.distanceToQueen > 180 || safeFriendlyTowers.length === 0) {
        safeCoordinates = {
            x: friendlyBarracks[0].x,
            y: friendlyBarracks[0].y
        }
    } else {
        const farestTowerToRun = findFarestBuilding({ buildingsArray: safeFriendlyTowers.filter(tower => tower.distanceToQueen > 180 )})

        safeCoordinates = {
            x: farestTowerToRun.x,
            y: farestTowerToRun.y
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