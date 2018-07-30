// import { DECK_SIZE, HEALTH, CARDS_IN_HAND, MANA } from 'constants'

import { createNewPlayer } from "./createPlayer";
import { HEALTH, MANA, DECK_SIZE, CARDS_IN_HAND } from './constants'
printErr(createNewPlayer, 'create new player', HEALTH, MANA, DECK_SIZE)
const player = createNewPlayer()
const opponent = createNewPlayer()

// game loop
while (true) {
  const playerInputs = readline().split(' ');
  player.set(HEALTH, parseInt(playerInputs[0]))
  player.set(MANA, parseInt(playerInputs[1]))
  player.set(DECK_SIZE, parseInt(playerInputs[2]))

  const opponentInputs = readline().split(' ');
  opponent.set(HEALTH, parseInt(opponentInputs[0]))
  opponent.set(MANA, parseInt(opponentInputs[1]))
  opponent.set(DECK_SIZE, parseInt(opponentInputs[2]))

  let opponentHand = parseInt(readline());
  let cardCount = parseInt(readline());
  for (let i = 0; i < cardCount; i++) {
    let inputs = readline().split(' ');
    let cardNumber = parseInt(inputs[0]);
    let instanceId = parseInt(inputs[1]);
    let location = parseInt(inputs[2]);
    let cardType = parseInt(inputs[3]);
    let cost = parseInt(inputs[4]);
    let attack = parseInt(inputs[5]);
    let defense = parseInt(inputs[6]);
    let abilities = inputs[7];
    let myHealthChange = parseInt(inputs[8]);
    let opponentHealthChange = parseInt(inputs[9]);
    let cardDraw = parseInt(inputs[10]);
  }

  print('PASS');
}
