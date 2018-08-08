import { CHARGE, GUARD, LETHAL, WARD } from "./constants"
import { checkHasAbility } from "./utils"
import { getCardInitialValue } from './pick'

const findGuards = cards => cards.filter(card => checkHasAbility({ card, ability: GUARD }))

const findCardsOnBoardValue = cards => cards.reduce((value, card) => {
  value += getCardInitialValue(card) // TODO: add specials

  return value
}, 0)

const getMonstersOnBoardValue = ({ opponentCardsOnBoard, myCardsOnBoard }) => {
  printErr('opponentCardsOnBoard', opponentCardsOnBoard.length, findCardsOnBoardValue(opponentCardsOnBoard))
  printErr('myCardsOnBoard', myCardsOnBoard.length, findCardsOnBoardValue(myCardsOnBoard))
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

const getAllAttackResults = ({ opponentDefendingCards, myCardsThatCanAttack }) => {
  const allAttackingCombinations = getCombinations(myCardsThatCanAttack.length, opponentDefendingCards.length)

  //allAttackingCombinations.forEach()
  const allCombinations = allAttackingCombinations.reduce((acc, combination) => {
    // myCardsThatCanAttack lenght and combinations length should be the same.
    const attackingPermutations = getPermutations(myCardsThatCanAttack.map((card, i) => i))

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
          myCreaturesThatDidntAttack.push(attackingCard.instanceId)

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
          defendingCardInstanceId: opponentDefendingCards[combination[index]].instanceId,
          attackingCardInstanceId: myCardsThatCanAttack[index].instanceId
        })),
        monstersOnBoardValue: getMonstersOnBoardValue({
          myCardsOnBoard: myCardsAfterBattle.filter(card => card.defense > 0),
          opponentCardsOnBoard: opponentCardsAfterBattle.filter(card => card.defense > 0)
        }),
        myCreaturesThatDidntAttack
      })
    })

    return acc
  }, [])

  return allCombinations
}

export const getPlayCommand = ({ myCardsOnBoard, myCardsSummonedThisTurn, opponentCardsOnBoard }) => {
  let opponentGuards = findGuards(opponentCardsOnBoard)

  const myCardsThatCanAttack = myCardsOnBoard.filter(cardOnBoard => {
      const summonedCard = myCardsSummonedThisTurn.find(cardSummonedThisTurn => cardSummonedThisTurn.instanceId === cardOnBoard.instanceId)

      if (summonedCard) {
        return checkHasAbility({ card: summonedCard, ability: CHARGE })
      }

      return true
    }
  )

  // attack guards
  if (myCardsThatCanAttack.length > 0) {
    let command = ''

    if (opponentGuards.length > 0) {
      const attackingResults = getAllAttackResults({
        myCardsThatCanAttack,
        opponentDefendingCards: opponentGuards
      })

      const opponentMinResult = Math.min(...attackingResults.map(res => res.monstersOnBoardValue.opponentValue))
      const oppMinAttackingResults = attackingResults.filter(res => res.monstersOnBoardValue.opponentValue === opponentMinResult)
      const maxResult = Math.max(...oppMinAttackingResults.map(res => res.monstersOnBoardValue.myValue))

      const bestAttack = attackingResults.find(res => {
        return res.monstersOnBoardValue.opponentValue === opponentMinResult && res.monstersOnBoardValue.myValue === maxResult
      })

      bestAttack.attacks.forEach(attack => {
        command += `ATTACK ${attack.attackingCardInstanceId} ${attack.defendingCardInstanceId}; `
      })

      if (bestAttack.myCreaturesThatDidntAttack.length > 0) {
        bestAttack.myCreaturesThatDidntAttack.forEach(creature => {
          command += `ATTACK ${creature.instanceId} -1 Don't worry! Be happy!; `
        })
      }
    }

    return command.trim()
  }

  return ''
}
