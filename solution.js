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
  getClosestKnightToQueen,
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

const checkIfInRadius = ({ x1, y1, x_center, y_center, radius }) => {
  // console.error('checkIfInRadius', x1, x_center, y1, y_center, radius)
  // console.error('calc', ((x1 - x_center) * (x1 - x_center)) + ((y1 - y_center) * (y1 - y_center)), radius * radius)
  // console.error('result', ((x1 - x_center) * (x1 - x_center)) + ((y1 - y_center) * (y1 - y_center)) < radius * radius)
  return ((x1 - x_center) * (x1 - x_center)) + ((y1 - y_center) * (y1 - y_center)) < radius * radius
}

const checkIfBuildingIsSafeToBuildUpon = ({ building, enemyTowers }) =>
    !enemyTowers.some(enemyTower =>
      checkIfInRadius({
        x1: building.x,
        y1: building.y,
        x_center: enemyTower.x,
        y_center: enemyTower.y,
        radius: enemyTower.attackRadius
      })
  )

const getBuildTowersCommand = ({ safeFriendlyTowersNotUpgradedToMax, safeNeutralBuildings }) => {
  if (safeFriendlyTowersNotUpgradedToMax.length > 0) { // should upgrade tower
    return getBuildTowerToTheMaxCommand({ tower: findNearestBuilding({ buildingsArray: safeFriendlyTowersNotUpgradedToMax }) })
  } else {
    const nearestNeutralBuilding = findNearestBuilding({ buildingsArray: safeNeutralBuildings })

    return getBuildTowerToTheMaxCommand({ tower: nearestNeutralBuilding })
  }
}

const getMoveOrBuildCommand = ({ queen, units, buildings, trainingBuildings }) => {
  const enemyKnights = units.filter(unit => unit.owner === ENEMY && unit.type === KNIGHT)
  const enemyBuildings = Object.values(buildings).filter(building => building.owner === ENEMY)
  const enemyTowers = enemyBuildings.filter(building => building.type === TOWER)

  const friendlyBuildings = Object.values(buildings).filter(building => building.owner === ALLY)
  const safeFriendlyBuildings = friendlyBuildings.filter(building =>
    checkIfBuildingIsSafeToBuildUpon({ building, enemyTowers })
  )
  // console.error('safeFriendlyBuildings', safeFriendlyBuildings)
  const friendlyBarracks = friendlyBuildings.filter(building => building.type === BARRACKS)
  const friendlyMines = friendlyBuildings.filter(building => building.type === MINE)
  const friendlyTowers = friendlyBuildings.filter(building => building.type === TOWER)

  const safeFriendlyMines = safeFriendlyBuildings.filter(building => building.type === MINE)
  const safeFriendlyTowers = safeFriendlyBuildings.filter(building => building.type === TOWER)

  const neutralBuildings = Object.values(buildings).filter(building => building.owner === NEUTRAL)
  const safeNeutralBuildings = neutralBuildings.filter(building => checkIfBuildingIsSafeToBuildUpon({ building, enemyTowers }))
  // console.error('safeNeutralBuildings', safeNeutralBuildings)
  const nonEnemyBuildings = friendlyBuildings.concat(neutralBuildings)

  const safeFriendlyMinesNotUpgradedToMax = safeFriendlyMines.filter(mine => !isMineUpgradedToTheMax({ mine }))
  const safeNeutralBuildingsThatMineCanBeBuildUpon = safeNeutralBuildings.filter(building => building.gold !== 0)

  const safeFriendlyTowersNotUpgradedToMax = safeFriendlyTowers.filter(tower => !isTowerUpgradedToTheMax({ tower }))

  trainingBuildings.setIds(friendlyBarracks.map(barrack => barrack.id))
  const closestKnightToQueen = getClosestKnightToQueen({ queen, enemyKnights })

  if (enemyKnights.length > 0 && closestKnightToQueen.distanceToQueen < 200) { // should run from knights
    return getRunFromKnightsCommand({ queen, closestKnightToQueen, safeFriendlyTowers, enemyTowers, friendlyBarracks })
  } else if (friendlyBarracks.length < 1) { // should build barracks
    const barrack = findNearestBuilding({
      buildingsArray: nonEnemyBuildings.filter(building => building.owner === NEUTRAL)
    })

    return getBuildBarracksCommand({ barrack, trainingBuildings })
  } else if (enemyKnights.length < 5 &&
      ((friendlyMines.length < NUMBER_OF_MINES_TO_BUILD && safeNeutralBuildingsThatMineCanBeBuildUpon.length > 0) // should build mines
      || (friendlyMines.length === NUMBER_OF_MINES_TO_BUILD && safeFriendlyMinesNotUpgradedToMax.length > 0))
  ) {

    if (safeFriendlyMinesNotUpgradedToMax.length > 0) { // should upgrade existing mine
      return getBuildMineToTheMaxCommand({ mine: findNearestBuilding({ buildingsArray: safeFriendlyMinesNotUpgradedToMax }) })
    } else { // should build new mine+
      const nearestMine = findNearestBuilding({ buildingsArray: safeNeutralBuildingsThatMineCanBeBuildUpon })

      return getBuildMineToTheMaxCommand({ mine: nearestMine })
    }
  } else if ((friendlyTowers.length < NUMBER_OF_TOWERS_TO_BUILD && safeNeutralBuildings.length > 0)  //shouldBuildTowers
      || (friendlyTowers.length === NUMBER_OF_TOWERS_TO_BUILD && safeFriendlyTowersNotUpgradedToMax.length > 0)) {

    return getBuildTowersCommand({ safeFriendlyTowersNotUpgradedToMax, safeNeutralBuildings })
  } else {
    return 'WAIT'
  }
}

const NUMBER_OF_TOWERS_TO_BUILD = 4
export const NUMBER_OF_MINES_TO_BUILD = 2

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
      attackRadius: Math.sqrt(((param1 * 1000) + (Math.PI * param2 * param2)) / Math.PI),
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

  console.log(moveOrBuildCommand)

  const shouldTrain = true

  if (trainingBuildings.getIds().length > 0 && shouldTrain) {
    console.log(`TRAIN ${trainingBuildings.getIds().join(' ')}`)
  } else {
    console.log('TRAIN')
  }
}
