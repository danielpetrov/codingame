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
    if ((defendingCard.defense - attackingCard.attack) < 0) {
      return 0
    }

    if (checkHasAbility({ card: attackingCard, ability: LETHAL })) {
      return 0
    }

    return defendingCard.defense - attackingCard.attack
  }

  return defendingCard.defense // no damage
}

function getCombinations(numberOfAttackingCards, numberOfDefendingCards) {
  let result = [Array.apply(null, {length: numberOfAttackingCards}).map(function(){return "0"}).join("")];

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
  wardsLost: 0 // TODO: implement
})

const getAllAttackResults = ({ opponentDefendingCards, myCardsThatCanAttack, withPermutations }) => {
  const allAttackingCombinations = getCombinations(myCardsThatCanAttack.length, opponentDefendingCards.length)

  //allAttackingCombinations.forEach()
  const allCombinations = allAttackingCombinations.reduce((acc, combination) => {
    // myCardsThatCanAttack lenght and combinations length should be the same.
    let attackingPermutations
    if (withPermutations) {
      attackingPermutations = getPermutations(myCardsThatCanAttack.map((card, i) => i))
    } else {
      attackingPermutations = [
        myCardsThatCanAttack
        .sort((card1, card2) => {
          if (getCardInitialValue(card1) > getCardInitialValue(card2)) {
            return 1
          }
          if (getCardInitialValue(card1) < getCardInitialValue(card2)) {
            return -1
          }

          return 0
        })
        .map((card, i) => i)
      ]
    }

    attackingPermutations.forEach(permutation => {
      combination = combination.toString()
      const opponentCardsAfterBattle = JSON.parse(JSON.stringify(opponentDefendingCards))
      const myCardsAfterBattle = JSON.parse(JSON.stringify(myCardsThatCanAttack))
      const terminatedOpponentCreatures = []
      const myCreaturesThatDidntAttack = []

      permutation.forEach(i => {
        const attackingCardIndex = i
        const attackingCard = myCardsThatCanAttack[attackingCardIndex]
        const defendingCardIndex = combination[i]
        const defendingCard = opponentDefendingCards[defendingCardIndex]

        // if already terminated
        if (terminatedOpponentCreatures.indexOf(defendingCard.instanceId) !== -1) {
          myCreaturesThatDidntAttack.push(attackingCard)

          return
        }

        const { defendingCardRemainingHealth, attackingCardRemainingHealth } = getAttackResults({ attackingCard, defendingCard })

        if (defendingCardRemainingHealth === 0) {
          terminatedOpponentCreatures.push(defendingCard.instanceId)
        }

        opponentCardsAfterBattle[defendingCardIndex].defense = defendingCardRemainingHealth
        myCardsAfterBattle[attackingCardIndex].defense = attackingCardRemainingHealth
      })

      acc.push({
        attacks: permutation.map((value, index) => ({
          defendingCardInstanceId: opponentCardsAfterBattle[combination[index]].instanceId,
          attackingCardInstanceId: myCardsAfterBattle[index].instanceId
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

  return attackingResults.find(res => {
    return res.monstersOnBoardValue.opponentValue === opponentMinResult && res.monstersOnBoardValue.myValue === maxResult
  })
}

const MAX_CARDS_WITH_PERTMUTATIONS = 5

export const getPlayCommand = ({ player, myCardsOnBoard, myCardsSummonedThisTurn = [], opponentCardsOnBoard }) => {
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
      const bestAttacks = getBestAttacks({ myCards: myCardsThatCanAttack, opponentCards: opponentGuards, withPermutations: myCardsThatCanAttack.length < 4 && opponentGuards.length < 4 })

      bestAttacks.attacks.forEach(attack => {
        command += `ATTACK ${attack.attackingCardInstanceId} ${attack.defendingCardInstanceId}; `
      })

      if (bestAttacks.terminatedOpponentCreatures.length > 0) {
        opponentGuards = opponentGuards.filter(card => !bestAttacks.terminatedOpponentCreatures.some(instanceId => instanceId === card.instanceId))
      }

      myCardsThatCanAttack = bestAttacks.myCreaturesThatDidntAttack
    }

    if (myCardsThatCanAttack.length > 0 && opponentGuards.length === 0) {
      if (opponentCardsWithoutGuard.length > 0) {
        const opponentCardsOnBoardTotalDamage = opponentCardsWithoutGuard.reduce((sum, card) => {
          sum += card.attack

          return sum
        }, 0)

        if (opponentCardsOnBoardTotalDamage >= player.get(HEALTH)) {
          // printErr('bla2', myCardsThatCanAttack.length, opponentCardsWithoutGuard.length, command)

          const bestAttacks = getBestAttacks({ myCards: myCardsThatCanAttack, opponentCards: opponentCardsWithoutGuard, withPermutations: myCardsThatCanAttack.length < 4 && opponentCardsWithoutGuard.length < 4 })

          bestAttacks.attacks.forEach(attack => {
            command += `ATTACK ${attack.attackingCardInstanceId} ${attack.defendingCardInstanceId}; `
          })

          if (bestAttacks.terminatedOpponentCreatures.length > 0) {
            opponentCardsWithoutGuard = opponentCardsWithoutGuard.filter(card => !bestAttacks.terminatedOpponentCreatures.some(instanceId => instanceId === card.instanceId))
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
