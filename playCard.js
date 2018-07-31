import { MANA } from "./constants"

const subArraySum = (array,  sum) => {
  let curr_sum, i, j;

  // Pick a starting point
  for (i = 0; i < array.length; i++) {
    curr_sum = array[i];

    // try all subarrays starting with 'i'
    for (j = i + 1; j <= n; j++) {
      if (curr_sum === sum) {
        printErr("Sum found between indexes %d and %d", i, j - 1);
        return 1;
      }
      if (curr_sum > sum || j == n)
        break;
      curr_sum = curr_sum + arr[j];
    }
  }

  printErr("No subarray found");
  return 0;
}

export const getSummonCommand = ({ player, myCardsInHand, myCardsOnBoard, opponentCardsOnBoard }) => {
  if (myCardsOnBoard < 6 && myCardsInHand > 0) {
    if (player.get(MANA) > 0) {
      const myCardsInHandCosts = myCardsInHand.map(card => card.cost)
      subArraySum(myCardsInHandCosts, player.get(MANA))

    }
  }
}