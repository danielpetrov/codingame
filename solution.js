import {
  BARRACKS,
  MINE,
  TOWER,
  STRUCTURE_TYPE_ENUMS,
  KNIGHT,
  QUEEN,
  UNIT_TYPE_ENUMS,
  ALLY,
  ENEMY,
  NEUTRAL,
  OWNER_ENUMS
} from './constants'

import {
  calculateDistance,
  findNearestBuilding,
  isTowerUpgradedToTheMax,
  getClosesKnightToQueen,
  isMineUpgradedToTheMax,
  getBuildMineToTheMaxCommand,
  getBuildTowerToTheMaxCommand,
  getBuildBarracksCommand,
} from './utils'
import {getRunFromKnightsCommand} from "./runFromKnights"

const numberOfBuildings = parseInt(readline())
const initialBuildingDetails = {}

for (let i = 0; i < numberOfBuildings; i++) {
  const inputs = readline().split(' ')
  const id = parseInt(inputs[0])
  const x = parseInt(inputs[1])
  const y = parseInt(inputs[2])
  const radius = parseInt(inputs[3])

  initialBuildingDetails[id] = {
    id,
    x,
    y,
    radius
  }
}


const getMoveOrBuildCommand = ({ queen, units, buildings, trainingBuildings }) => {
  const enemyKnights = units.filter(unit => unit.owner === ENEMY && unit.type === KNIGHT)
  const friendlyBuildings = Object.values(buildings).filter(building => building.owner === ALLY)
  const neutralBuildings = Object.values(buildings).filter(building => building.owner === NEUTRAL)
  const nonEnemyBuildings = friendlyBuildings.concat(neutralBuildings)
  const friendlyBarracks = Object.values(friendlyBuildings).filter(building => building.type === BARRACKS)
  const friendlyMines = Object.values(friendlyBuildings).filter(building => building.type === MINE)
  const friendlyTowers = Object.values(friendlyBuildings).filter(building => building.type === TOWER)

  const friendlyMinesNotUpgradedToMax = friendlyMines.filter(mine => !isMineUpgradedToTheMax({ mine }))
  const friendlyTowersNotUpgradedToMax = friendlyTowers.find(tower => !isTowerUpgradedToTheMax({ tower }))

  trainingBuildings.setIds(friendlyBarracks.map(barrack => barrack.id))

  if (enemyKnights.length > 0) { // should run from knights
    const closestKnightToQueen = getClosesKnightToQueen({ queen, enemyKnights })

    if (closestKnightToQueen.distanceToQueen < 200) {
      return getRunFromKnightsCommand({ queen, closestKnightToQueen })
    }
  } else if(friendlyBarracks.length < 1) { // should build barracks
    const barrack = findNearestBuilding({
      buildingsArray: nonEnemyBuildings.filter(building => building.owner === NEUTRAL)
    })

    return getBuildBarracksCommand({ barrack, trainingBuildings })
  } else if (friendlyMines.length < NUMBER_OF_MINES_TO_BUILD  // should build mines
      || !(friendlyMines.length === NUMBER_OF_MINES_TO_BUILD && friendlyMinesNotUpgradedToMax.length > 0)) {

    if (friendlyMinesNotUpgradedToMax.length > 0) { // should upgrade existing mine
      const nearestNotUpgradedMine = friendlyMinesNotUpgradedToMax.length === 1 ?
          friendlyMinesNotUpgradedToMax[0]
          : findNearestBuilding({ buildingsArray: friendlyMinesNotUpgradedToMax })

      return getBuildMineToTheMaxCommand({ mine: nearestNotUpgradedMine })
    } else { // should build new mine+

      const nearestMine = findNearestBuilding({
        buildingsArray: neutralBuildings.filter(building => !isMineUpgradedToTheMax({ mine: building })) // building.type === MINE &&
      })

      return getBuildMineToTheMaxCommand({ mine: nearestMine })
    }

  } else if (friendlyTowers.length < NUMBER_OF_TOWERS_TO_BUILD  //shouldBuildTowers
      || (friendlyTowers.length === NUMBER_OF_TOWERS_TO_BUILD && friendlyTowersNotUpgradedToMax.length > 0)) {

    if (friendlyTowers.length === NUMBER_OF_TOWERS_TO_BUILD && friendlyTowersNotUpgradedToMax.length > 0) { // should upgrade tower
      return getBuildTowerToTheMaxCommand({ tower: findNearestBuilding({ buildingsArray: friendlyTowers }) })
    } else {
      const nearestNeutralBuilding = findNearestBuilding({ buildingsArray: neutralBuildings })

      return getBuildTowerToTheMaxCommand({ tower: nearestNeutralBuilding })
    }

  } else {
    let safeCoordinates

    if (friendlyTowers.length >= 2) {
      safeCoordinates = {
        x: Math.floor((friendlyTowers[0].x + friendlyTowers[1].x) / 2),
        y: Math.floor((friendlyTowers[0].y + friendlyTowers[1].y) / 2)
      }
    } else {
      safeCoordinates = {
        x: 0,
        y: 0
      }
    }

    return `MOVE ${safeCoordinates.x} ${safeCoordinates.y}`
  }
}

const NUMBER_OF_TOWERS_TO_BUILD = 2
export const NUMBER_OF_MINES_TO_BUILD = 3

const getTrainingBuildings = () => {
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

// game loop
while (true) {
  const inputs = readline().split(' ')
  const gold = parseInt(inputs[0])
  const touchedBuildingByQueen = parseInt(inputs[1]) // -1 if none

  const buildings = {}
  const trainingBuildings = getTrainingBuildings()

  for (let i = 0; i < numberOfBuildings; i++) {
    const inputs = readline().split(' ')
    const id = parseInt(inputs[0])
    const gold = parseInt(inputs[1])
    const maxMineSize = parseInt(inputs[2])
    const type = STRUCTURE_TYPE_ENUMS[inputs[3]] // -1 = No structure, 2 = Barracks
    const owner = OWNER_ENUMS[inputs[4]] // -1 = No structure, 0 = Friendly, 1 = Enemy
    const param1 = parseInt(inputs[5]) // tower hp,  the income rate ranging from 1 to 5 (or -1 if enemy)
    const param2 = parseInt(inputs[6]) // attack radius for tower

    buildings[id] = {
      id,
      type,
      owner,
      maxMineSize,
      gold,
      isTouchedByQueen: touchedBuildingByQueen === id,
      towerHp: param1,
      incomeRate: param1,
      attackRadius: param2,
      ...initialBuildingDetails[id]
    }
  }

  const numberOfUnits = parseInt(readline())
  const units = []

  for (let i = 0; i < numberOfUnits; i++) {
    const inputs = readline().split(' ')
    const x = parseInt(inputs[0])
    const y = parseInt(inputs[1])
    const owner = OWNER_ENUMS[inputs[2]]
    const type = UNIT_TYPE_ENUMS[inputs[3]] // -1 = QUEEN, 0 = KNIGHT, 1 = ARCHER
    const health = parseInt(inputs[4])

    units.push({
      x,
      y,
      owner,
      type,
      health
    })
  }

  const queen = units.find(unit => unit.type === QUEEN && unit.owner === ALLY)

  Object.keys(buildings).map(id => {
    buildings[id].distanceToQueen = calculateDistance({
      x1: queen.x,
      x2: buildings[id].x,
      y1: queen.y,
      y2: buildings[id].y
    })
  })


  const moveOrBuildCommand = getMoveOrBuildCommand({
    queen,
    units,
    buildings,
    trainingBuildings
  })

  print(moveOrBuildCommand)

  const shouldTrain = true

  if (trainingBuildings.getIds().length > 0 && shouldTrain) {
    print(`TRAIN ${trainingBuildings.getIds().join(' ')}`)
  } else {
    print('TRAIN')
  }
}
