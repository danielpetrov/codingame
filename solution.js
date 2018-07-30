import { createNewPlayer } from "./createPlayer";
import { HEALTH, MANA, DECK_SIZE, CARDS_IN_HAND } from './constants'

const player = createNewPlayer()
const opponent = createNewPlayer()

// game loop
while (true) {
  const playerInputs = readline().split(' ')
  player.set(HEALTH, parseInt(playerInputs[0]))
  player.set(MANA, parseInt(playerInputs[1]))
  player.set(DECK_SIZE, parseInt(playerInputs[2]))

  const opponentInputs = readline().split(' ')
  opponent.set(HEALTH, parseInt(opponentInputs[0]))
  opponent.set(MANA, parseInt(opponentInputs[1]))
  opponent.set(DECK_SIZE, parseInt(opponentInputs[2]))

  const opponentCardsCount = parseInt(readline())
  opponent.set(CARDS_IN_HAND, opponentCardsCount)
  const boardAndPlayersCardCount = parseInt(readline())
  player.set(CARDS_IN_HAND, boardAndPlayersCardCount)

  for (let i = 0; i < cardCount; i++) {
    const inputs = readline().split(' ')
    const cardNumber = parseInt(inputs[0])
    const instanceId = parseInt(inputs[1])
    const location = parseInt(inputs[2])
    const cardType = parseInt(inputs[3])
    const cost = parseInt(inputs[4])
    const attack = parseInt(inputs[5])
    const defense = parseInt(inputs[6])
    const abilities = inputs[7]
    const myHealthChange = parseInt(inputs[8])
    const opponentHealthChange = parseInt(inputs[9])
    const cardDraw = parseInt(inputs[10])

    if (player.get(MANA) === 0) { // DRAW PHASE

    }
  }

  print('PASS')
}
