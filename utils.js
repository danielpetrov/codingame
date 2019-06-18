import {BARRACKS_TYPE_KNIGHT, MINE, TOWER} from "./constants"

export const calculateDistance = ({ x1, y1, x2, y2 }) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

export const findNearestBuilding = ({ buildingsArray }) => buildingsArray
    .reduce((acc, building) => {
        if (building.distanceToQueen < acc.distanceToQueen) {
            acc = building
        }

        return acc
    }, { distanceToQueen: 99999 })

export const isMineUpgradedToTheMax = ({ mine }) =>
    (mine.incomeRate === mine.maxMineSize) || (mine.gold < 10 && mine.gold !== -1)

export const isTowerUpgradedToTheMax = ({ tower }) => tower.towerHp > 650

export const getInBounderies = ({ x, y }) => {
    if (x < 0) {
        x = 0
    }
    if (y < 0) {
        y = 0
    }
    if (x > 1920) {
        x = 1920
    }
    if (y > 1000) {
        y = 1000
    }

    return { x, y }
}

export const getClosesKnightToQueen = ({ enemyKnights, queen }) => {
    return enemyKnights.reduce((acc, knight) => {
        const distanceToQueen = calculateDistance({
            x1: queen.x,
            x2: knight.x,
            y1: queen.y,
            y2: knight.y
        })

        if (distanceToQueen < acc.distanceToQueen) {
            acc.distanceToQueen = distanceToQueen
            acc.id = knight.id
            acc.x = knight.x
            acc.y = knight.y
        }

        return acc
    }, { distanceToQueen: 3000, id: -1, x: 0, y: 0 })
}

export const getBuildMineToTheMaxCommand = ({ mine }) => {
    console.error('build mine')
    if (mine.isTouchedByQueen) {
        return `BUILD ${mine.id} ${MINE}`
    } else {
        return `MOVE ${mine.x} ${mine.y}`
    }
}
export const getBuildTowerToTheMaxCommand = ({ tower }) => {
    console.error('build tower')
    if (tower.isTouchedByQueen) {
        return `BUILD ${tower.id} ${TOWER}`
    } else {
        return `MOVE ${tower.x} ${tower.y}`
    }
}
export const getBuildBarracksCommand = ({ barrack, trainingBuildings }) => {
    console.error('build barrack')
    if (barrack.isTouchedByQueen) {
        trainingBuildings.addId(barrack.id)
        return `BUILD ${barrack.id} ${BARRACKS_TYPE_KNIGHT}`
    } else {
        return `MOVE ${barrack.x} ${barrack.y}`
    }
}
