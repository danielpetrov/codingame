import { MANA } from "./constants"

const getAllSubsets = myCardsInHand => myCardsInHand.reduce(
    (subsets, value) => subsets.concat(
      subsets.map(set => [value,...set])
    ),
    [[]]
  );

const sumCards = cards => cards.reduce((sum, card) => sum + card.cost, 0)

export const getSummonCommand = ({ player, myCardsInHand, myCardsOnBoard, opponentCardsOnBoard }) => {
  let output = ''

  if (myCardsOnBoard.length < 6 && myCardsInHand.length > 0) {
    let remainingMana = player.get(MANA)

    const possibleCardsToPlay = getAllSubsets(myCardsInHand)
      .filter(cards => sumCards(cards) <= remainingMana)
      .map(cards => ({
        cards,
        totalCost: sumCards(cards)
      }))


    const maxTotalCostToPlay = Math.max(...possibleCardsToPlay.map(cards => cards.totalCost))
    const cardsToSummon = possibleCardsToPlay.find(cards => cards.totalCost === maxTotalCostToPlay)

    cardsToSummon.cards.map(card => output += `SUMMON ${card.instanceId}; `)
  }

  return output.trim()
}
