import { HEALTH, MANA, DECK_SIZE, CARDS_IN_HAND } from './constants'

export const getPlayerInitialDetails = () => ({
  [HEALTH]: 0,
  [MANA]: 0,
  [DECK_SIZE]: 0,
  [CARDS_IN_HAND]: 0
})

export const createNewPlayer = () => {
  const details = getPlayerInitialDetails()

  return {
    set: function set(propName, value) {
      details[propName] = value
    },
    get: function get(propName) {
      return details[propName]
    }
  }
}
