export const BARRACKS = 'BARRACKS'
export const MINE = 'MINE'
export const TOWER = 'TOWER'
export const STRUCTURE_TYPE_ENUMS = {
    '2': BARRACKS,
    '1': TOWER,
    '0': MINE
}
export const KNIGHT = 'KNIGHT'
export const ARCHER = 'ARCHER'
export const QUEEN = 'QUEEN'
export const UNIT_TYPE_ENUMS = {
    '-1': QUEEN,
    '0': KNIGHT,
    '1': ARCHER
}
export const BARRACKS_TYPE_KNIGHT = `${BARRACKS}-${KNIGHT}`
export const BARRACKS_TYPE_ARCHER = `${BARRACKS}-${ARCHER}`
export const ALLY = 'ALLY'
export const ENEMY = 'ENEMY'
export const NEUTRAL = 'NEUTRAL'
export const OWNER_ENUMS = {
    '-1': NEUTRAL,
    '0': ALLY,
    '1': ENEMY
}

