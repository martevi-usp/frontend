export type Route = 'home' | 'puzzle'

export const PUZZLE_HASH = '#/quebra-cabeca'

/** Hash routing keeps the static host simple: no rewrite rules, no router
 *  dependency for two screens. Anything unrecognised is the home page. */
export function routeFromHash(hash: string): Route {
  return hash === PUZZLE_HASH ? 'puzzle' : 'home'
}
