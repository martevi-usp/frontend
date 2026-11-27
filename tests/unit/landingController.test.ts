import { describe, expect, it } from 'vitest'
import { INITIAL_LANDING_STATE, reduceLandingState } from '../../src/landing/controller'

describe('landing controller', () => {
  it('starts with the atrium preview selected', () => {
    expect(INITIAL_LANDING_STATE).toEqual({ activeDestination: 'atrium' })
  })

  it('selects a destination without mutating the previous state', () => {
    const previous = INITIAL_LANDING_STATE
    const next = reduceLandingState(previous, {
      type: 'destination-selected',
      destination: 'puzzle',
    })

    expect(next).toEqual({ activeDestination: 'puzzle' })
    expect(next).not.toBe(previous)
    expect(previous).toEqual({ activeDestination: 'atrium' })
  })

  it('keeps the same state object when the active destination is selected again', () => {
    const next = reduceLandingState(INITIAL_LANDING_STATE, {
      type: 'destination-selected',
      destination: 'atrium',
    })

    expect(next).toBe(INITIAL_LANDING_STATE)
  })
})

