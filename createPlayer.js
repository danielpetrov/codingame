import { playerInitialDetails } from 'constants'

export const createNewPlayer = () => {
  const details = playerInitialDetails

  return {
    set: function set(propName, value) {
      details[propName] = value
    },
    get: function get(propName) {
      return details[propName]
    }
  }
}
