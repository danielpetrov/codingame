import {
  MINE,
  TOWER,
  STRUCTURE_TYPE_ENUMS,
  KNIGHT,
  QUEEN,
  UNIT_TYPE_ENUMS,
  ALLY,
  ENEMY,
  NEUTRAL,
  OWNER_ENUMS,
  BARRACKS_TYPE_ENUMS,
  BARRACKS,
  ARCHER
} from './constants'

import {
  calculateDistance,
  findNearestBuilding,
  isTowerUpgradedToTheMax,
  getClosestKnightToQueen,
  isMineUpgradedToTheMax,
  getBuildMineToTheMaxCommand,
  getBuildBarracksCommand,
  checkIfBuildingIsSafeToBuildUpon,
  getBuildTowersCommand,
  getBuildArchersCommand,
  initialCoordinatesFactory,
  getTrainingBuildingsFactory
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

const NUMBER_OF_TOWERS_TO_BUILD = 4
const NUMBER_OF_MINES_TO_BUILD = 4
const NUMBER_OF_KNIGHT_BARRACKS_TO_BUILD = 1
const NUMBER_OF_ARCHERS_BARRACKS_TO_BUILD = 1

let shouldTrainKnights = false
let shouldTrainArchers = false
let minesBuild = 0

const getMoveOrBuildCommand = ({ queen, units, buildings, knightsTrainingBuildings,
                                 archersTrainingBuildings, initialCoordinates, gold }) => {
  const enemyKnights = units.filter(unit => unit.owner === ENEMY && unit.type === KNIGHT)
  const enemyBuildings = Object.values(buildings).filter(building => building.owner === ENEMY)
  const enemyTowers = enemyBuildings.filter(building => building.type === TOWER)
  const friendlyArchers = units.filter(unit => unit.owner === ALLY && unit.type === ARCHER)
  const enemyBarracks = enemyBuildings.filter(building => building.type === BARRACKS)
  const enemyKnightBarracks = enemyBarracks.filter(building => building.type === BARRACKS && building.barrackType === KNIGHT)

  const friendlyBuildings = Object.values(buildings).filter(building => building.owner === ALLY)
  const safeFriendlyBuildings = friendlyBuildings.filter(building =>
    checkIfBuildingIsSafeToBuildUpon({ building, enemyTowers })
  )
  // console.error('safeFriendlyBuildings', safeFriendlyBuildings)
  const friendlyKnightBarracks = friendlyBuildings.filter(building => building.type === BARRACKS && building.barrackType === KNIGHT)
  const friendlyArcherBarracks = friendlyBuildings.filter(building => building.type === BARRACKS && building.barrackType === ARCHER)
  const friendlyMines = friendlyBuildings.filter(building => building.type === MINE)
  const friendlyTowers = friendlyBuildings.filter(building => building.type === TOWER)

  const safeFriendlyMines = safeFriendlyBuildings.filter(building => building.type === MINE)
  const safeFriendlyTowers = safeFriendlyBuildings.filter(building => building.type === TOWER)

  const neutralBuildings = Object.values(buildings).filter(building => building.owner === NEUTRAL)
  const safeNeutralBuildings = neutralBuildings.filter(building => checkIfBuildingIsSafeToBuildUpon({ building, enemyTowers }))

  const safeFriendlyMinesNotUpgradedToMax = safeFriendlyMines.filter(mine => !isMineUpgradedToTheMax({ mine }))
  const safeNeutralBuildingsThatMineCanBeBuildUpon = safeNeutralBuildings.filter(building => building.gold !== 0)

  const safeFriendlyTowersNotUpgradedToMax = safeFriendlyTowers.filter(tower => !isTowerUpgradedToTheMax({ tower }))

  if (friendlyArchers.length < enemyKnights.length / 2 && enemyKnightBarracks.length > 0) {
    shouldTrainArchers = true
  } else {
    shouldTrainArchers = false
  }

  if (enemyTowers.length <= 4) {
    shouldTrainKnights = true
  } else {
    shouldTrainKnights = false
  }

  if (friendlyMines.length > minesBuild) {
    minesBuild = friendlyMines.length
  }

  knightsTrainingBuildings.setIds(friendlyKnightBarracks.map(barrack => barrack.id))
  archersTrainingBuildings.setIds(friendlyArcherBarracks.map(barrack => barrack.id))

  const closestKnightToQueen = getClosestKnightToQueen({ queen, enemyKnights })

  //if (enemyKnights.length > 0 && closestKnightToQueen.distanceToQueen < 300 && friendlyTowers.length !== NUMBER_OF_TOWERS_TO_BUILD) { // should run from knights
    //return getRunFromKnightsCommand({ initialCoordinates, queen, safeFriendlyTowers })
  //}else
  if (shouldTrainArchers && friendlyArcherBarracks.length < NUMBER_OF_ARCHERS_BARRACKS_TO_BUILD && safeNeutralBuildings.length > 0) { // should build archer barracks
    const barrack = findNearestBuilding({
      buildingsArray: safeNeutralBuildings
    })

    return getBuildArchersCommand({ barrack, trainingBuildings: archersTrainingBuildings })
  } else if (shouldTrainKnights && friendlyKnightBarracks.length < NUMBER_OF_KNIGHT_BARRACKS_TO_BUILD && safeNeutralBuildings.length > 0) { // should build knight barracks
    const barrack = findNearestBuilding({
      buildingsArray: safeNeutralBuildings
    })

    return getBuildBarracksCommand({ barrack, trainingBuildings: knightsTrainingBuildings })
  } else if (closestKnightToQueen.distanceToQueen > 500 &&
      ((friendlyMines.length < NUMBER_OF_MINES_TO_BUILD && safeNeutralBuildingsThatMineCanBeBuildUpon.length > 0 && minesBuild < NUMBER_OF_MINES_TO_BUILD) // should build mines
      || (friendlyMines.length === NUMBER_OF_MINES_TO_BUILD && safeFriendlyMinesNotUpgradedToMax.length > 0 && minesBuild <= NUMBER_OF_MINES_TO_BUILD))
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

const initialCoordinates = initialCoordinatesFactory()

// game loop
while (true) {
  const inputs = readline().split(' ')
  let gold = parseInt(inputs[0])
  const touchedBuildingByQueen = parseInt(inputs[1]) // -1 if none
  const buildings = {}
  const knightsTrainingBuildings = getTrainingBuildingsFactory()
  const archersTrainingBuildings = getTrainingBuildingsFactory()

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

    if (type === BARRACKS) {
      buildings[id].barrackType = BARRACKS_TYPE_ENUMS[param2] // KNIGHT, ARCHER, GIANT
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

  initialCoordinates.setCoordinates(queen)

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
    initialCoordinates: initialCoordinates.getCoordinates(),
    knightsTrainingBuildings,
    archersTrainingBuildings,
    gold
  })

  console.log(moveOrBuildCommand)

  const buildingsIdsForTraining = []

  if (shouldTrainArchers && gold >= 100 && archersTrainingBuildings.getIds().length > 0) {
    buildingsIdsForTraining.push(archersTrainingBuildings.getIds())
    gold -= 100
  }

  if (shouldTrainKnights && gold >= 80 && knightsTrainingBuildings.getIds().length > 0) {
    buildingsIdsForTraining.push(knightsTrainingBuildings.getIds())
    gold -= 80
  }

  if (buildingsIdsForTraining.length > 0) {
    console.log(`TRAIN ${buildingsIdsForTraining.join(' ')}`)
  } else {
    console.log('TRAIN')
  }
}
