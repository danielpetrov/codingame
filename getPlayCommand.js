export const getPlayCommand = ({ myCardsOnBoard, opponentCardsOnBoard }) => {
  let output = ''
  let opponentGuards = opponentCardsOnBoard.filter(c => c.abilities.toLowerCase().includes('g'))

  myCardsOnBoard.forEach(cardWhichAttacks => {
    if (opponentGuards.length > 0) {
      output += `ATTACK ${cardWhichAttacks.instanceId} ${opponentGuards[0].instanceId}; `

      if (cardWhichAttacks.abilities.toLowerCase().includes('l') && !opponentGuards[0].abilities.toLowerCase().includes('w')) {
        opponentGuards = opponentGuards.slice(1)
      } else if (cardWhichAttacks.attack >= opponentGuards[0].defense && !opponentGuards[0].abilities.toLowerCase().includes('w')) {
        opponentGuards = opponentGuards.slice(1)
      }

    } else {
      output += `ATTACK ${cardWhichAttacks.instanceId} -1 Don't worry! Be happy!; `
    }
  })

  return output.trim()
}
