import { GUARD, LETHAL, WARD } from "./constants"
import { checkHasAbility } from "./utils"
import { getCardInitialValue } from './pick'

const findGuards = cards => cards.filter(card => checkHasAbility({ card, ability: GUARD }))

const findCardsOnBoardValue = cards => cards.reduce((value, card) => {
  value += getCardInitialValue(card) // TODO: add specials

  return value
}, value)

const getMonstersOnBoardValue = ({ opponentCardsOnBoard, myCardsOnBoard }) => {
  const opponentValue = findCardsOnBoardValue(opponentCardsOnBoard)
  const myValue = findCardsOnBoardValue(myCardsOnBoard)

  return {
    opponentValue,
    myValue
  }
}

const checkIsTerminated = ({ attackingCard, defendingCard }) => !checkHasAbility({
    card: defendingCard,
    ability: WARD
  }) &&
  (checkHasAbility({ card: attackingCard, ability: LETHAL }) || attackingCard.attack >= defendingCard.defense)

const takeDamage = ({ attackingCard, defendingCard }) => {
  if (!checkHasAbility({ card: defendingCard, ability: WARD })) {
    if ((defendingCard.defense - attackingCard.attack) < 0) {
      return 0
    }

    if (checkHasAbility({ card: attackingCard, ability: LETHAL })) {
      return 0
    }

    return defendingCard.defense - attackingCard.attack
  }

  return defendingCard.defense // no damage
}

const getAttackResults = ({ attackingCard, defendingCard }) => ({
  defendingCardRemainingHealth: takeDamage({ attackingCard, defendingCard }),
  attackingCardRemainingHealth: takeDamage({ attackingCard: defendingCard, defendingCard: attackingCard }),
  healthGained: 0, // TODO: implement
  wardsLost: 0 // TODO: implement
})

const gerAllAttackResults = ({ possibleOpponentAttacks, myCardsThatCanAttack, attackingCardIndex, defendingCardIndex }) => {
  const allCombinations = []


  for (let i = 0; i < myCards.length; i++) {
    const attackingCard = myCards[i]

    for (let j = 0; j < myCards.length; j++) {
      const defendingCard = opponentCards[j]

      const { defendingCardRemainingHealth, attackingCardRemainingHealth } = getAttackResults({
        attackingCard,
        defendingCard
      })

      if (defendingCardRemainingHealth === 0) {
        opponentCards[j].isTerminated = true
      }


    }
  }

  allCombinations.push({
    terminal: true,
    possibleOpponentAttacks,
    myCardsThatCanAttack
  })
}
}

const getAllAttackResults = ({ possibleOpponentAttacks, myCardsThatCanAttack, }) => {
  const allCombos = []

  myCardsThatCanAttack.forEach(attackingCard => {
    possibleOpponentAttacks.forEach(defendingCard => {
      allCombos.push({ attackingCard, defendingCard })
    })
  })

}
/*const attackCreature = ({ possibleOpponentAttacks, myCardsThatCanAttack }) => {
  const possibleAttackResults = []

  myCardsThatCanAttack.forEach(attackingCard => {
    possibleOpponentAttacks.forEach(defendingCard => {
      possibleAttackResults.push({
        ...getAttackResults({ attackingCard, defendingCard }),
        attackingCardInstanceId: attackingCard.instanceId,
        defendingCardInstanceId: defendingCard.instanceId
      })
    })
  })

  const max = Math.max(...possibleAttackResults.map(result => result.attackingCardRemainingHealth))
  const min = Math.min(...possibleAttackResults.map(result => result.defendingCardRemainingHealth))

  // if ward
  const { opponentsWithWards, opponentsWithoutWards } = possibleOpponentAttacks.reduce((acc, card) => {
    if (checkHasAbility({ card, ability: WARD })) {
      acc = acc.opponentsWithWards.concat(card)
    } else {
      acc = acc.opponentsWithoutWards.concat(card)
    }

    return acc
  }, { opponentsWithWards: [], opponentsWithoutWards: []})

  // wards:

  // possibleOpponentAttacks
}*/

export const getPlayCommand = ({ myCardsOnBoard, opponentCardsOnBoard }) => {
  let opponentGuards = findGuards(opponentCardsOnBoard)

  // attack guards
  const command = myCardsOnBoard.reduce((command, attackingCard) => {
    if (opponentGuards.length > 0) {
      command += `ATTACK ${attackingCard.instanceId} ${opponentGuards[0].instanceId}; `

      if (checkIsTerminated({ attackingCard, defendingCard: opponentGuards[0] })) {
        opponentGuards = opponentGuards.slice(1)
      }
    } else {
      command += `ATTACK ${attackingCard.instanceId} -1 Don't worry! Be happy!; `
    }

    return command
  }, '')

  return command.trim()
}


var combination = { codes: [], result: [], counter: 0 };


var getCombinations = function (allOptionsArray, combination) {
  if (allOptionsArray.length > 0) {
    for (var i = 0; i < allOptionsArray[0].length; i++) {
      var tmp = allOptionsArray.slice(0);
      combination.codes[combination.counter] = allOptionsArray[0][i];
      tmp.shift();
      combination.counter++;
      getCombinations(tmp, combination);
    }
  } else {
    var combi = combination.codes.slice(0);
    combination.result.push(combi);
  }
  combination.counter--;
}

//use it:
var a = ["01", "02", "03"];
var b = ["white", "green", "blue"];

var allOptionsArray = [a, b];

getCombinations(allOptionsArray, combination);

for (var i = 0; i < combination.result.length; i++) {
  console.log(combination.result[i]);
}

function cartesian() {
  var r = [], arg = arguments, max = arg.length - 1;

  function helper(arr, i) {
    for (var j = 0, l = arg[i].length; j < l; j++) {
      var a = arr.slice(0);
// clone arr
      a.push(arg[i][j])
      if (i == max) {
        r.push(a);
      } else {
        helper(a, i + 1);
      }
    }
  }
  helper([], 0);
  return r;

}

cartesian([1,2,3], ['A', 'B', 'C'])
