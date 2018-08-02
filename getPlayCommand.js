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

const checkIsTerminated = ({ attackingCard, defendingCard }) => !checkHasAbility({ card: defendingCard, ability: WARD }) &&
  (checkHasAbility({ card: attackingCard, ability: LETHAL }) || attackingCard.attack >= defendingCard.defense)

const attack = ({ attackingCard, defendingCard }) => ({
  isDefendingCardTerminated: !checkHasAbility({ card: defendingCard, ability: WARD }) &&
    (checkHasAbility({ card: attackingCard, ability: LETHAL }) || defendingCard.defense <= attackingCard.attack),
  isAttackingCardTerminated: defendingCard.attack >= attackingCard.defense
})
const attackCreature = ({ opponentCardsOnBoard, myCardsOnBoard }) => {
  myCardsOnBoard.forEach(myCard => {

  })
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
      command += `ATTACK ${cardWhichAttacks.instanceId} -1 Don't worry! Be happy!; `
    }

    return command
  }, '')

  return command.trim()
}
