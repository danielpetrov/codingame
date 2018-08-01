import mutatis from 'mutatis'
import { playerInitialDetails } from "./initialState"
import { HEALTH, MANA, DECK_SIZE, CARDS_IN_HAND_COUNT } from './constants'
import { pick } from './pick'
import { getSummonCommand } from "./getSummonCommand"
import { getPlayCommand } from "./getPlayCommand";

let player = mutatis(playerInitialDetails)
let opponent = mutatis(playerInitialDetails)

// game loop
while (true) {
  const playerInputs = readline().split(' ')
  player = player.set(HEALTH, parseInt(playerInputs[0]))
  player = player.set(MANA, parseInt(playerInputs[1]))
  player = player.set(DECK_SIZE, parseInt(playerInputs[2]))

  const opponentInputs = readline().split(' ')
  opponent = opponent.set(HEALTH, parseInt(opponentInputs[0]))
  opponent = opponent.set(MANA, parseInt(opponentInputs[1]))
  opponent = opponent.set(DECK_SIZE, parseInt(opponentInputs[2]))

  const opponentCardsCount = parseInt(readline())
  opponent = opponent.set(CARDS_IN_HAND_COUNT, opponentCardsCount)

  const visibleCardsCount = parseInt(readline())
  let cards = []

  for (let i = 0; i < visibleCardsCount; i++) {
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

    cards = cards.concat({ cardNumber, instanceId, location, cardType, cost, attack, defense, abilities, myHealthChange, opponentHealthChange, cardDraw })
  }

  if (player.get(MANA) === 0) { // DRAW PHASE
    print(`PICK ${pick({ cards })}`)
  } else { // PLAY PHASE
    const myCardsInHand = cards.filter(card => card.location === 0)
    const myCardsOnBoard = cards.filter(card => card.location === 1)
    const opponentCardsOnBoard = cards.filter(card => card.location === -1)

    player.set(CARDS_IN_HAND_COUNT, myCardsInHand.size)

    let output = ''

    output += getSummonCommand({ player, myCardsInHand, myCardsOnBoard, opponentCardsOnBoard })
    output += getPlayCommand({ player, myCardsInHand, myCardsOnBoard, opponentCardsOnBoard })

    if (output === '') {
      output = 'PASS'
    }

    print(output)
  }
}
