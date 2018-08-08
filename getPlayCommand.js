import { GUARD, LETHAL, WARD } from "./constants"
import { checkHasAbility } from "./utils"
import { getCardInitialValue } from './pick'

const findGuards = cards => cards.filter(card => checkHasAbility({ card, ability: GUARD }))

const findCardsOnBoardValue = cards => cards.reduce((value, card) => {
  value += getCardInitialValue(card) // TODO: add specials

  return value
}, value)

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

const getAttackResults = ({ attackingCard, defendingCard }) => ({
  defendingCardRemainingHealth: takeDamage({ attackingCard, defendingCard }),
  attackingCardRemainingHealth: takeDamage({ attackingCard: defendingCard, defendingCard: attackingCard }),
  healthGained: 0, // TODO: implement
  wardsLost: 0 // TODO: implement
})

const gerAllAttackResults = ({ opponentDefendingCards, myCardsThatCanAttack }) => {
  const allDefendingCardCombinations = getCombinations(opponentDefendingCards.length)

  const allCombinations = allDefendingCardCombinations.reduce((acc, combination) => {
    combination = combination.toString()

    for (let i = 0; i < combination.length; i++) {
      acc = acc.concat(getAttackResults({ attackingCard: myCardsThatCanAttack[i], defendingCard: opponentDefendingCards[combination[i]] }))
    }
  }, [])
}

export const getPlayCommand = ({ myCardsOnBoard, opponentCardsOnBoard }) => {
  let opponentGuards = findGuards(opponentCardsOnBoard)

  // attack guards
  const command = myCardsOnBoard.reduce((command, attackingCard) => {
    if (opponentGuards.length > 0) {
      command += `ATTACK ${attackingCard.instanceId} ${opponentGuards[0].instanceId}; `

      if (checkIsTerminated({ attackingCard, defendingCard: opponentGuards[0] })) {
        opponentGuards = opponentGuards.slice(1)
      }
    } else {
      command += `ATTACK ${attackingCard.instanceId} -1 Don't worry! Be happy!; `
    }

    return command
  }, '')

  return command.trim()
}
