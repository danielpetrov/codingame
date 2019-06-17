const BARRACKS = 'BARRACKS'
const MINE = 'MINE'
const TOWER = 'TOWER'
const STRUCTURE_TYPE_ENUMS = {
  '2': BARRACKS,
  '1': TOWER,
  '0': MINE
}
const KNIGHT = 'KNIGHT'
const ARCHER = 'ARCHER'
const QUEEN = 'QUEEN'
const UNIT_TYPE_ENUMS = {
  '-1': QUEEN,
  '0': KNIGHT,
  '1': ARCHER
}
const BARRACKS_TYPE_KNIGHT = `${BARRACKS}-${KNIGHT}`
const BARRACKS_TYPE_ARCHER = `${BARRACKS}-${ARCHER}`
const ALLY = 'ALLY'
const ENEMY = 'ENEMY'
const NEUTRAL = 'NEUTRAL'
const OWNER_ENUMS = {
  '-1': NEUTRAL,
  '0': ALLY,
  '1': ENEMY
}

const calculateDistance = ({ x1, y1, x2, y2 }) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

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

const NUMBER_OF_TOWERS_TO_BUILD = 2
const NUMBER_OF_MINES_TO_BUILD = 3

const findNearestBuilding = ({ buildingsArray }) => buildingsArray
    .reduce((acc, building) => {
      if (building.distanceToQueen < acc.distanceToQueen) {
        acc.distanceToQueen = building.distanceToQueen
        acc.buildingId = building.id
      }

      return acc
    }, { distanceToQueen: 3000, buildingId: -1 })
const isMineUpgradedToTheMax = ({ buildings, mineId }) =>
    (buildings[mineId].incomeRate === buildings[mineId].maxMineSize) || (buildings[mineId].gold < 10 && buildings[mineId].gold !== -1)

const isTowerUpgradedToTheMax = ({ buildings, towerId }) => buildings[towerId] && buildings[towerId].towerHp > 720
const isQueenTouchingBuilding = ({ buildings, buildingId }) => buildings[buildingId] && buildings[buildingId].isTouchedByQueen

const goToBuilding = ({ buildings, buildingId }) => {
  print(`MOVE ${buildings[buildingId].x} ${buildings[buildingId].y}`)
}

const buildMineToTheMaxAtTheNearestBuilding = ({ buildings, buildingId }) => {
  if (isQueenTouchingBuilding({ buildings, buildingId })) {
    if (isMineUpgradedToTheMax({ buildings, mineId: buildingId })) {
      print('WAIT')
    } else {
      print(`BUILD ${buildingId} ${MINE}`)
    }
  } else {
    return goToBuilding({ buildings, buildingId })
  }
}
const buildTowerToTheMaxAtTheNearestBuilding = ({ buildings, buildingId }) => {
  if (isQueenTouchingBuilding({ buildings, buildingId })) {
    if (isTowerUpgradedToTheMax({ buildings, towerId: buildingId })) {
      print('WAIT')
    } else {
      print(`BUILD ${buildingId} ${TOWER}`)
    }
  } else {
    return goToBuilding({ buildings, buildingId })
  }
}
const buildBarracksToTheNearestBuildingAndTrain = ({ buildings, buildingId }) => {
  if (isQueenTouchingBuilding({ buildings, buildingId })) {
    if (buildings[buildingId].owner === NEUTRAL) {
      print(`BUILD ${buildingId} ${BARRACKS_TYPE_KNIGHT}`)
      trainingBuilding.push(buildingId)
    }
  } else {
    return goToBuilding({ buildings, buildingId })
  }
}

const safeCoordinates = {
  x: 0,
  y: 0
}

const getInBounderies = ({ x, y }) => {
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

let trainingBuilding = []

// game loop
while (true) {
  const inputs = readline().split(' ')
  const gold = parseInt(inputs[0])
  const touchedBuildingByQueen = parseInt(inputs[1]) // -1 if none

  const buildings = {}

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

  const friendlyBuildings = Object.values(buildings).filter(building => building.owner === ALLY)
  const neutralBuildings = Object.values(buildings).filter(building => building.owner === NEUTRAL)
  const nonEnemyBuildings = friendlyBuildings.concat(neutralBuildings)
  const friendlyBarracks = Object.values(friendlyBuildings).filter(building => building.type === BARRACKS)
  const friendlyMines = Object.values(friendlyBuildings).filter(building => building.type === MINE)
  const friendlyTowers = Object.values(friendlyBuildings).filter(building => building.type === TOWER)

  if (friendlyTowers.length === NUMBER_OF_TOWERS_TO_BUILD) {
    safeCoordinates.x = Math.floor((friendlyTowers[0].x + friendlyTowers[1].x) / 2)
    safeCoordinates.y = Math.floor((friendlyTowers[0].y + friendlyTowers[1].y) / 2)
  }

  const enemyKnights = units.filter(unit => unit.owner === ENEMY && unit.type === KNIGHT)
  let shouldRunFromKnights = false

  if (enemyKnights.length > 0) {
    const closestKnightToQueen = enemyKnights.reduce((acc, knight) => {
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

    shouldRunFromKnights = closestKnightToQueen.distanceToQueen < 200

    if (shouldRunFromKnights) {
      const isQueenAboveKnight = closestKnightToQueen.y - queen.y > 0
      const isQueenOnTheRightToKnight = queen.x - closestKnightToQueen.x > 0
      let runningY
      let runningX

      if (isQueenAboveKnight) {
        runningY = queen.y + (queen.y - closestKnightToQueen.y)
      } else {
        runningY = queen.y - (queen.y - closestKnightToQueen.y)
      }

      if (isQueenOnTheRightToKnight) {
        runningX = queen.x + (queen.x - closestKnightToQueen.x)
      } else {
        runningX = queen.x - (queen.x - closestKnightToQueen.x)
      }

      const { x: bounderiesRunningX, y: bounderiesRunningY } = getInBounderies({ x: runningX, y: runningY })

      const { distanceToQueen, buildingId } = findNearestBuilding({ buildingsArray: neutralBuildings })

      if (distanceToQueen < 150) {
        buildTowerToTheMaxAtTheNearestBuilding({ buildings: neutralBuildings, buildingId })
      } else {
        print(`MOVE ${bounderiesRunningX} ${bounderiesRunningY}`)
      }

    }
  }

  const shouldBuildBarraks = friendlyBarracks.length < 1

  let lastMine

  if (friendlyMines.length === NUMBER_OF_MINES_TO_BUILD) {
    lastMine = friendlyMines.find(mine => !isMineUpgradedToTheMax({ buildings, mineId: mine.id }))
  }
  const shouldBuildMines = !shouldBuildBarraks && (
      friendlyMines.length < NUMBER_OF_MINES_TO_BUILD || (friendlyMines.length === NUMBER_OF_MINES_TO_BUILD && lastMine !== undefined)
  )

  let lastTower

  if (friendlyTowers.length === NUMBER_OF_TOWERS_TO_BUILD) {
    lastTower = friendlyTowers.find(tower => !isTowerUpgradedToTheMax({ buildings, towerId: tower.id }))
  }

  const shouldBuildTowers = !shouldBuildBarraks && !shouldBuildMines && (
      friendlyTowers.length < NUMBER_OF_TOWERS_TO_BUILD || (friendlyTowers.length === NUMBER_OF_TOWERS_TO_BUILD && lastTower !== undefined)
  )

  // build 1 barracks, 3 mines and 4 towers then rest.
  if (shouldBuildBarraks) {
    const { buildingId } = findNearestBuilding({
      buildingsArray: nonEnemyBuildings.filter(building => building.owner === NEUTRAL)
    })

    buildBarracksToTheNearestBuildingAndTrain({ buildings, buildingId })
  }

  if (shouldBuildMines && !shouldRunFromKnights) {
    if (friendlyMines.length === NUMBER_OF_MINES_TO_BUILD) {
      buildMineToTheMaxAtTheNearestBuilding({ buildings, buildingId: lastMine.id })
    } else {
      const { buildingId } = findNearestBuilding({
        buildingsArray: nonEnemyBuildings.filter(building => {
              return (
                  building.type === MINE
                  && !isMineUpgradedToTheMax({ buildings, mineId: building.id })
                  && building.owner === ALLY
              ) || (building.owner === NEUTRAL && (building.gold > 10 || building.gold === -1))
            }
        )
      })

      buildMineToTheMaxAtTheNearestBuilding({ buildings, buildingId })
    }
  }

  if (shouldBuildTowers && !shouldRunFromKnights) {
    if (friendlyTowers.length === NUMBER_OF_TOWERS_TO_BUILD) {
      buildTowerToTheMaxAtTheNearestBuilding({ buildings, buildingId: lastTower.id })
    } else {
      const { buildingId } = findNearestBuilding({
        buildingsArray: nonEnemyBuildings.filter(building =>
            (
                building.type === TOWER
                && !isTowerUpgradedToTheMax({ buildings, towerId: building.id })
                && building.owner === ALLY
            )
            || building.owner === NEUTRAL
        )
      })

      buildTowerToTheMaxAtTheNearestBuilding({ buildings, buildingId })
    }
  }

  if (!shouldBuildBarraks && !shouldBuildMines && !shouldBuildTowers && !shouldRunFromKnights) {
    print(`MOVE ${safeCoordinates.x} ${safeCoordinates.y}`)
  }

  if (trainingBuilding.length > 0) {
    print(`TRAIN ${trainingBuilding.join(' ')}`)
  } else {
    print('TRAIN')
  }
}
