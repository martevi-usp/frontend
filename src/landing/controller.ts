import type { LandingDestinationId } from './content'

export interface LandingState {
  activeDestination: LandingDestinationId
}

export type LandingAction = {
  type: 'destination-selected'
  destination: LandingDestinationId
}

export const INITIAL_LANDING_STATE: LandingState = { activeDestination: 'atrium' }

/** Controller for the destination preview in the landing page's MVC slice. */
export function reduceLandingState(state: LandingState, action: LandingAction): LandingState {
  if (action.type === 'destination-selected' && action.destination !== state.activeDestination) {
    return { activeDestination: action.destination }
  }
  return state
}

