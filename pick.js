const costToBalanceMeter = {
  0: '1',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6+',
  7: '7+',
  8: '8+',
  9: '8+',
  10: '8+',
  11: '8+',
  12: '8+'
}

const balanceMeter = {
  '1': 0,
  '2': 0,
  '3': 0,
  '4': 0,
  '5': 0,
  '6+': 0
}

const deck = [

]
const VALUES_OF_ABILITIES = {
  'L': 5.5,
  'W': 4,
  'G': 2,
  'B': 1,
  'D': 1,
  'C': 1,
  '-': 0
}

const shouldBalanceDeck = ({ deck }) => {

}

const getAbilitiesValue = abilities => {
  abilities = abilities.split('')

  return abilities.reduce((sum ,ability) => {
    return sum + VALUES_OF_ABILITIES[ability]
  }, 0)
}


const getCardValue = ({ cost, attack, defense, abilities, myHealthChange, opponentHealthChange, cardDraw, cardType }) => {
  let value = 0

  if (cardType === 0) { // if creature
    if (cost < 5) { // TODO: improve formula
      value = (attack + (defense * 1.25))
    } else {
      value = (attack + defense)
    }

    printErr('value', value)
    value = value + getAbilitiesValue(abilities)
  } else {
    value = 1 //TODO: implement
  }

  value = value - ((cost || 1) * 2)

  printErr('value with cost', value, cost)

  if (balanceMeter[costToBalanceMeter[cost]] >= 5) {
    value -= balanceMeter[costToBalanceMeter[cost]] / 2
    printErr('value with balance', value, cost)
  }

  return value
}

/*export const pick = ({ player, cardNumber, instanceId, location, cardType, cost, attack, defense, abilities, myHealthChange, opponentHealthChange, cardDraw }) => {


}*/

export const pick = ({ cards }) => {
  const cardValues = cards.map(getCardValue)
  const max = Math.max(...cardValues)

  printErr(...cardValues)
  const indexOfCardToPick = cardValues.indexOf(max)
  const cardToPick = cards[indexOfCardToPick]

  deck.push(cardToPick)

  balanceMeter[costToBalanceMeter[cardToPick.cost]]++

  return indexOfCardToPick
}
