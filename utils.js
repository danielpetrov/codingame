import {BARRACKS_TYPE_ARCHER, BARRACKS_TYPE_KNIGHT, MINE, TOWER} from "./constants"

export const calculateDistance = ({ x1, y1, x2, y2 }) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

export const findNearestBuilding = ({ buildingsArray }) => buildingsArray
    .reduce((acc, building) => {
        if (building.distanceToQueen < acc.distanceToQueen) {
            acc = building
        }

        return acc
    }, { distanceToQueen: 99999 })

export const findFarestBuilding = ({ buildingsArray }) => buildingsArray
    .reduce((acc, building) => {
        if (building.distanceToQueen > acc.distanceToQueen) {
            acc = building
        }

        return acc
    }, { distanceToQueen: 0 })
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

export const getClosestKnightToQueen = ({ enemyKnights, queen }) => {
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
export const getBuildArchersCommand = ({ barrack, trainingBuildings }) => {
    console.error('build barrack')
    if (barrack.isTouchedByQueen) {
        trainingBuildings.addId(barrack.id)
        return `BUILD ${barrack.id} ${BARRACKS_TYPE_ARCHER}`
    } else {
        return `MOVE ${barrack.x} ${barrack.y}`
    }
}
export const checkIfInRadius = ({ x1, y1, x_center, y_center, radius }) => {
    // console.error('checkIfInRadius', x1, x_center, y1, y_center, radius)
    // console.error('calc', ((x1 - x_center) * (x1 - x_center)) + ((y1 - y_center) * (y1 - y_center)), radius * radius)
    // console.error('result', ((x1 - x_center) * (x1 - x_center)) + ((y1 - y_center) * (y1 - y_center)) < radius * radius)
    return ((x1 - x_center) * (x1 - x_center)) + ((y1 - y_center) * (y1 - y_center)) < radius * radius
}

export const checkIfBuildingIsSafeToBuildUpon = ({ building, enemyTowers }) =>
    !enemyTowers.some(enemyTower =>
        checkIfInRadius({
            x1: building.x,
            y1: building.y,
            x_center: enemyTower.x,
            y_center: enemyTower.y,
            radius: enemyTower.attackRadius
        })
    )

export const getBuildTowersCommand = ({ safeFriendlyTowersNotUpgradedToMax, safeNeutralBuildings }) => {
    if (safeFriendlyTowersNotUpgradedToMax.length > 0) { // should upgrade tower
        return getBuildTowerToTheMaxCommand({ tower: findNearestBuilding({ buildingsArray: safeFriendlyTowersNotUpgradedToMax }) })
    } else {
        const nearestNeutralBuilding = findNearestBuilding({ buildingsArray: safeNeutralBuildings })

        return getBuildTowerToTheMaxCommand({ tower: nearestNeutralBuilding })
    }
}

export const getTrainingBuildingsFactory = () => {
    let ids = []

    return {
        getIds: () => {
            return ids
        },
        addId: (id) => {
            ids.push(id)
        },
        setIds: (newIds) => {
            ids = newIds
        }
    }
}

export const initialCoordinatesFactory = () => {
    let coordinates = {}
    let set = false

    return {
        setCoordinates: (queen) => {
            if (!set) {
                coordinates = {
                    x: queen.x,
                    y: queen.y
                }

                set = true
            }
        },
        getCoordinates: () => {
            return coordinates
        }
    }
}
