import { CHARGE, GUARD, HEALTH, LETHAL, WARD } from "./constants"
import { checkHasAbility } from "./utils"
import { getCardInitialValue } from './pick'

const findGuards = cards => cards.filter(card => checkHasAbility({ card, ability: GUARD }))

const findCardsOnBoardValue = cards => cards.reduce((value, card) => {
  value += getCardInitialValue(card) // TODO: add specials

  return value
}, 0)

const getMonstersOnBoardValue = ({ opponentCardsOnBoard, myCardsOnBoard }) => {
  const opponentValue = findCardsOnBoardValue(opponentCardsOnBoard)
  const myValue = findCardsOnBoardValue(myCardsOnBoard)

  return {
    opponentValue,
    myValue
  }
}

const checkIsTerminated = ({ attackingCard, defendingCard }) => !checkHasAbility({
    card: defendingCard,
    ability: WARD
  }) &&
  (checkHasAbility({ card: attackingCard, ability: LETHAL }) || attackingCard.attack >= defendingCard.defense)

const takeDamage = ({ attackingCard, defendingCard }) => {
  if (!checkHasAbility({ card: defendingCard, ability: WARD })) {
    if (checkHasAbility({ card: attackingCard, ability: LETHAL })) {
      return 0
    }

    if ((defendingCard.defense - attackingCard.attack) <= 0) {
      return 0
    }

    return defendingCard.defense - attackingCard.attack
  }

  return defendingCard.defense // no damage
}

function getCombinations(numberOfAttackingCards, numberOfDefendingCards) {
  let result = [Array.apply(null, { length: numberOfAttackingCards }).map(function () {
    return "0"
  }).join("")];

  for (let incrementingDigit = 0; incrementingDigit < numberOfAttackingCards; ++incrementingDigit) {
    var generation = [];

    for (let x of result) {
      for (let digitValue = 1; digitValue < numberOfDefendingCards; ++digitValue) {
        let y = x.slice(0, incrementingDigit) + digitValue + x.slice(incrementingDigit + 1);

        generation.push(y);
      }
    }

    result.push.apply(result, generation);
  }

  return result;
}

const getPermutations = xs => {
  let ret = []
  for (let i = 0; i < xs.length; i++) {
    let rest = getPermutations(xs.slice(0, i).concat(xs.slice(i + 1)));
    if (!rest.length) {
      ret.push([xs[i]])
    } else {
      for (let j = 0; j < rest.length; j++) {
        ret.push([xs[i]].concat(rest[j]))
      }
    }
  }

  return ret
}

const getAttackResults = ({ attackingCard, defendingCard }) => ({
  defendingCardRemainingHealth: takeDamage({ attackingCard, defendingCard }),
  attackingCardRemainingHealth: takeDamage({ attackingCard: defendingCard, defendingCard: attackingCard }),
  healthGained: 0, // TODO: implement
  defendingCardAbilities: defendingCard.abilities.replace(/W/g, '-'),
  attackingCardAbilities: attackingCard.abilities.replace(/W/g, '-')
})

const MAX_CARDS_WITH_COMBINATIONS = 7

const getAllAttackResults = ({ opponentDefendingCards, myCardsThatCanAttack }) => {
  const allAttackingCombinations = getCombinations(myCardsThatCanAttack.length, opponentDefendingCards.length)
  const withPermutations = myCardsThatCanAttack.length + opponentDefendingCards.length <= MAX_CARDS_WITH_COMBINATIONS
  let attackingPermutations

  if (withPermutations) {
    attackingPermutations = getPermutations(myCardsThatCanAttack.map((card, i) => i))
  } else {
    attackingPermutations = [
      myCardsThatCanAttack
        .sort((card1, card2) => {
          if (checkHasAbility({ card: card1, ability: LETHAL })) {
            return -1
          }
          if (checkHasAbility({ card: card2, ability: LETHAL })) {
            return 1
          }

          if (card1.attack > card2.attack) {
            return -1
          }
          if (card1.attack < card2.attack) {
            return 1
          }

          return 0
        })
        .map((card, i) => i)
    ]
  }

  //allAttackingCombinations.forEach()
  const allCombinations = allAttackingCombinations.reduce((acc, combination) => {
    attackingPermutations.forEach(permutation => {
      combination = combination.toString()
      const opponentCardsAfterBattle = opponentDefendingCards.slice(0)
      const myCardsAfterBattle = myCardsThatCanAttack.slice(0)
      const terminatedOpponentCreatures = []
      const myCreaturesThatDidntAttack = []

      permutation.forEach((value, index) => {
        const attackingCardIndex = value
        const attackingCard = myCardsAfterBattle[attackingCardIndex]
        const defendingCardIndex = combination[index]
        const defendingCard = opponentCardsAfterBattle[defendingCardIndex]

        // if already terminated
        // printErr('terminated at check', terminatedOpponentCreatures, defendingCard.instanceId, terminatedOpponentCreatures.indexOf(defendingCard.instanceId) !== -1)
        if (terminatedOpponentCreatures.indexOf(defendingCard.instanceId) !== -1) {
          myCreaturesThatDidntAttack.push(attackingCard)

          return
        }

        const { defendingCardRemainingHealth, attackingCardRemainingHealth, defendingCardAbilities, attackingCardAbilities } = getAttackResults({
          attackingCard,
          defendingCard
        })

        // printErr('defendingCardRemainingHealth', defendingCardRemainingHealth, attackingCard.instanceId, defendingCard.instanceId, defendingCardRemainingHealth === 0 && terminatedOpponentCreatures.indexOf(defendingCard.instanceId) === -1)
        if (defendingCardRemainingHealth === 0 && terminatedOpponentCreatures.indexOf(defendingCard.instanceId) === -1) {
          terminatedOpponentCreatures.push(defendingCard.instanceId)
          // printErr('terminated after push', terminatedOpponentCreatures)
        }

        //printErr('indexes', attackingCardIndex, defendingCardIndex, myCardsAfterBattle[attackingCardIndex].instanceId, opponentCardsAfterBattle[defendingCardIndex].instanceId)
        // printErr('ab1', opponentCardsAfterBattle[defendingCardIndex].abilities)
        opponentCardsAfterBattle[defendingCardIndex] = {
          ...defendingCard,
          defense: defendingCardRemainingHealth,
          abilities: defendingCardAbilities
        }
        // printErr('ab2', opponentCardsAfterBattle[defendingCardIndex].abilities)
        myCardsAfterBattle[attackingCardIndex] = {
          ...attackingCard,
          defense: attackingCardRemainingHealth,
          abilities: attackingCardAbilities
        }
      })

      acc.push({
        attacks: permutation.map(i => ({
          defendingCardInstanceId: opponentCardsAfterBattle[combination[i]].instanceId,
          attackingCardInstanceId: myCardsAfterBattle[i].instanceId
        })),
        monstersOnBoardValue: getMonstersOnBoardValue({
          myCardsOnBoard: myCardsAfterBattle.filter(card => card.defense > 0),
          opponentCardsOnBoard: opponentCardsAfterBattle.filter(card => card.defense > 0)
        }),
        myCreaturesThatDidntAttack,
        terminatedOpponentCreatures
      })
    })

    return acc
  }, [])

  return allCombinations
}

const attackOpponent = cards => {
  let command = ''

  cards.forEach(card => {
    command += `ATTACK ${card.instanceId} -1 Don't worry! Be happy!; `
  })

  return command.trim()
}

const getBestAttacks = ({ myCards, opponentCards, withPermutations }) => {
  const attackingResults = getAllAttackResults({
    myCardsThatCanAttack: myCards,
    opponentDefendingCards: opponentCards,
    withPermutations
  })

  const opponentMinResult = Math.min(...attackingResults.map(res => res.monstersOnBoardValue.opponentValue))
  const oppMinAttackingResults = attackingResults.filter(res => res.monstersOnBoardValue.opponentValue === opponentMinResult)
  const maxResult = Math.max(...oppMinAttackingResults.map(res => res.monstersOnBoardValue.myValue))
  const minMax = oppMinAttackingResults.filter(res => res.monstersOnBoardValue.myValue === maxResult)

  if (minMax.length === 1) {
    return minMax[0]
  } else {
    let maxCreaturesThatDidntAttackAttackValue = -1
    let minMaxIndex = null

    minMax.forEach((res, i) => {

      const creaturesThatDidntAttackAttackValue = res.myCreaturesThatDidntAttack.reduce((sum, card) => {
        sum += card.attack

        return sum
      }, 0)

      if (creaturesThatDidntAttackAttackValue > maxCreaturesThatDidntAttackAttackValue) {
        maxCreaturesThatDidntAttackAttackValue = creaturesThatDidntAttackAttackValue
        minMaxIndex = i
      }
    })

    return minMax[minMaxIndex]
  }
}

export const getPlayCommand = ({ player, opponent, myCardsOnBoard, myCardsSummonedThisTurn = [], opponentCardsOnBoard }) => {
  let myCardsThatCanAttack = myCardsOnBoard.filter(cardOnBoard => {
      const summonedCard = myCardsSummonedThisTurn.find(cardSummonedThisTurn => cardSummonedThisTurn.instanceId === cardOnBoard.instanceId)

      if (summonedCard) {
        return checkHasAbility({ card: summonedCard, ability: CHARGE })
      }

      return cardOnBoard.attack > 0
    }
  )

  // attack guards
  if (myCardsThatCanAttack.length > 0) {
    let command = ''
    let opponentGuards = findGuards(opponentCardsOnBoard)
    let opponentCardsWithoutGuard = opponentCardsOnBoard.filter(card => !checkHasAbility({ card, ability: GUARD }))

    if (opponentGuards.length > 0) {
      const bestAttacks = getBestAttacks({ myCards: myCardsThatCanAttack, opponentCards: opponentGuards })

      bestAttacks.attacks.forEach(attack => {
        command += `ATTACK ${attack.attackingCardInstanceId} ${attack.defendingCardInstanceId}; `
      })

      if (bestAttacks.terminatedOpponentCreatures.length > 0) {
        // opponentGuards = opponentGuards.filter(card => !bestAttacks.terminatedOpponentCreatures.some(instanceId => instanceId === card.instanceId))
      }

      myCardsThatCanAttack = bestAttacks.myCreaturesThatDidntAttack
    }

    // printErr('myCardsThatCanAttack.length', myCardsThatCanAttack.length)
    if (myCardsThatCanAttack.length > 0) {
      if (opponentCardsWithoutGuard.length > 0) {
        const opponentCardsOnBoardTotalDamage = opponentCardsWithoutGuard.reduce((sum, card) => {
          sum += card.attack

          return sum
        }, 0)
        const myCardsOnBoardTotalDamage = myCardsThatCanAttack.reduce((sum, card) => {
          sum += card.attack

          return sum
        }, 0)

        if (opponentCardsOnBoardTotalDamage >= player.get(HEALTH) && myCardsOnBoardTotalDamage < opponent.get(HEALTH)) {
          const bestAttacks = getBestAttacks({
            myCards: myCardsThatCanAttack,
            opponentCards: opponentCardsWithoutGuard
          })

          bestAttacks.attacks.forEach(attack => {
            command += `ATTACK ${attack.attackingCardInstanceId} ${attack.defendingCardInstanceId}; `
          })

          if (bestAttacks.terminatedOpponentCreatures.length > 0) {
            // opponentCardsWithoutGuard = opponentCardsWithoutGuard.filter(card => !bestAttacks.terminatedOpponentCreatures.some(instanceId => instanceId === card.instanceId))
          }

          myCardsThatCanAttack = bestAttacks.myCreaturesThatDidntAttack
        }
      }

      if (myCardsThatCanAttack.length > 0) {
        command += attackOpponent(myCardsThatCanAttack)
      }
    }

    return command.trim()
  }

  return ''
}
