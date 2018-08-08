import { MANA } from "./constants"

const MAX_CARDS_ON_BOARD = 6

const getAllSubsets = myCardsInHand => myCardsInHand.reduce(
    (subsets, value) => subsets.concat(
      subsets.map(set => [value,...set])
    ),
    [[]]
  );

const sumCards = cards => cards.reduce((sum, card) => sum + card.cost, 0)

export const summonCards = ({ player, myCardsInHand, myCardsOnBoard }) => {
  let command = ''
  let cardsToSummon = []
  if (myCardsOnBoard.length < MAX_CARDS_ON_BOARD && myCardsInHand.length > 0) {
    let remainingMana = player.get(MANA)

    const possibleCardsToPlay = getAllSubsets(myCardsInHand)
      .filter(cards => (sumCards(cards) <= remainingMana) && (cards.length <= (MAX_CARDS_ON_BOARD - myCardsOnBoard.length))) // less than remaining mana and les cards than room on board
      .map(cards => ({
        cards,
        totalCost: sumCards(cards)
      }))


    const maxTotalCostToPlay = Math.max(...possibleCardsToPlay.map(cards => cards.totalCost))
    cardsToSummon = possibleCardsToPlay
      .find(cards => cards.totalCost === maxTotalCostToPlay)

    command = cardsToSummon.cards.reduce((command, card) => {
      command += `SUMMON ${card.instanceId}; `

      return command
    }, '')
  }

  return {
    summonCommand: command.trim(),
    summonedCards: cardsToSummon.cards
  }
}
