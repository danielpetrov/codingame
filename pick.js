import {
  LETHAL,
  GUARD,
  BREAKTRHOUGH,
  CHARGE,
  WARD,
  DRAIN
} from './constants'
import { checkHasAbility } from './utils'

const costToBalanceMeter = {
  0: '1',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6+',
  7: '6+',
  8: '6+',
  9: '6+',
  10: '6+',
  11: '6+',
  12: '6+'
}

const balanceMeter = {
  '1': 0,
  '2': 0,
  '3': 0,
  '4': 0,
  '5': 0,
  '6+': 0
}

const deck = []

const VALUES_OF_ABILITIES = {
  [LETHAL]: 5.5,
  [WARD]: 4,
  [GUARD]: 2,
  [BREAKTRHOUGH]: 1,
  [DRAIN]: 1,
  [CHARGE]: 1,
  '-': 0
}

const getAbilitiesValue = abilities => {
  abilities = abilities.split('')

  return abilities.reduce((sum ,ability) => {
    return sum + VALUES_OF_ABILITIES[ability]
  }, 0)
}

const HEALTH_CHANGE_COEF = 1/10
const CARD_DRAW_COEF = 2

const getCardValue = card => {
  const { cost, attack, defense, abilities, myHealthChange, opponentHealthChange, cardDraw, cardType } = card
  let value = 0

  if (cardType === 0) { // if creature
    if (checkHasAbility({ card, ability: LETHAL })) {
      value = defense * 2
    } else {
      value = attack + defense
    }
    printErr('initial value', value)

    value = value + getAbilitiesValue(abilities)
    if (cardDraw) {
      value = value + (parseInt(cardDraw) * CARD_DRAW_COEF)
    }
    if (opponentHealthChange) {
      value = value + (parseInt(opponentHealthChange) * HEALTH_CHANGE_COEF)
    }
    if (myHealthChange) {
      value = value + (parseInt(myHealthChange) * HEALTH_CHANGE_COEF)
    }
    printErr('value with abilities', value)
  } else {
    value = -1 //TODO: implement
  }

  value = value - ((cost || 1) * 2)

  printErr('value minus cost', value)

  if (balanceMeter[costToBalanceMeter[cost]] >= 5) {
    value = value - (balanceMeter[costToBalanceMeter[cost]] / 2)
    printErr('value minus balance', value)
  }

  printErr('final value', value)
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
