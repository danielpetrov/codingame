import { GUARD, LETHAL, WARD } from "./constants"
import { checkHasAbility } from "./utils"

export const getPlayCommand = ({ myCardsOnBoard, opponentCardsOnBoard }) => {
  let opponentGuards = opponentCardsOnBoard.filter(card => checkHasAbility({ card, ability: GUARD }))

  const command = myCardsOnBoard.reduce((command, cardWhichAttacks) => {
    if (opponentGuards.length > 0) {
      command += `ATTACK ${cardWhichAttacks.instanceId} ${opponentGuards[0].instanceId}; `

      if (checkHasAbility({ card: cardWhichAttacks, ability: LETHAL }) && !checkHasAbility({ card: opponentGuards[0], ability: WARD })) {
        opponentGuards = opponentGuards.slice(1)
      } else if (cardWhichAttacks.attack >= opponentGuards[0].defense && !checkHasAbility({ card: opponentGuards[0], ability: WARD })) {
        opponentGuards = opponentGuards.slice(1)
      }

    } else {
      command += `ATTACK ${cardWhichAttacks.instanceId} -1 Don't worry! Be happy!; `
    }

    return command
  }, '')

  return command.trim()
}
