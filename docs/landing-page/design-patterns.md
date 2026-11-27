# Design-pattern catalog — landing page

## Pattern used: Model–View–Controller (MVC)

| Requested topic | Landing-page decision |
|---|---|
| Pattern | MVC, implemented as a small feature slice rather than an application-wide framework. |
| Problem in the project | The page needs substantial editorial content, an interactive destination preview, and several React layouts. Putting all three concerns in `HomePage.tsx` would make copy changes, state tests, and visual iteration interfere with one another. |
| Alternative considered | A single stateful page component containing arrays, reducer logic, and JSX. |
| Trade-off | MVC adds two small modules and explicit types. In return, state transitions are pure and independently testable, copy is reusable, and view components remain presentation-focused. |

### Concrete participants

- **Model:** `src/landing/content.ts`, especially `LandingDestination`,
  `MISSION_PILLARS`, and `LANDING_DESTINATIONS`.
- **View:** `HomePage`, `DestinationShowcase`,
  `LandingMuseumIllustration`, and `DaikiPage`.
- **Controller:** `reduceLandingState` and `INITIAL_LANDING_STATE` in
  `src/landing/controller.ts`. `HomePage` connects the controller with
  `useReducer` and dispatches `destination-selected` actions.

### Code examples

Model:

```ts
export interface LandingDestination {
  id: LandingDestinationId
  eyebrow: string
  title: string
  description: string
  action: string
  path: string
}
```

Controller:

```ts
export function reduceLandingState(state: LandingState, action: LandingAction): LandingState {
  if (action.type === 'destination-selected' && action.destination !== state.activeDestination) {
    return { activeDestination: action.destination }
  }
  return state
}
```

View-to-controller connection:

```tsx
<DestinationShowcase
  destinations={LANDING_DESTINATIONS}
  activeId={state.activeDestination}
  onSelect={(destination) => dispatch({ type: 'destination-selected', destination })}
/>
```

## Decision record

### Context

The old home was a placeholder. Its replacement has a long-form narrative,
repeated content, responsive visual components, and a preview that changes on
pointer hover or keyboard focus. The page must remain simple enough for a
course project and use patterns only where they solve a concrete problem.

### Decision

Use a feature-local MVC separation. Keep immutable content in one model,
express preview selection as a pure reducer, and let React components act as
views. Keep routing above the slice in `AppRoutes`.

### Options considered

1. **One stateful component:** fewest files, but mixes editorial data, state,
   navigation, and rendering in `HomePage`.
2. **MVC feature slice (chosen):** adds explicit boundaries while preserving
   idiomatic functional React.
3. **State pattern with one class per preview:** useful if each destination
   had complex entry/exit behavior; excessive for a single selected ID.
4. **Factory Method or Abstract Factory for previews:** useful if previews
   came in families or were created dynamically; three compile-time views do
   not justify factory objects.
5. **Facade over navigation:** would wrap React Router without simplifying a
   complex subsystem; real links are clearer and more accessible.
6. **Observer as an explicit custom implementation:** React already updates
   the view when reducer state changes. A second subscription layer would
   duplicate framework behavior.

### Consequences

Positive consequences:

- reducer behavior is covered by fast unit tests;
- route/view composition is covered independently by integration tests;
- editorial copy is centralized and typed;
- adding another text destination is data-driven;
- the components stay aligned with existing React and MUI conventions.

Negative consequences:

- the feature has more files than the old placeholder;
- preview visuals still require a view branch, so the implementation is not
  fully open for arbitrary plugin-like destination types;
- MVC terminology must be understood at module level because React functional
  components do not map to traditional class-based controllers.

## Patterns considered but not implemented

| Pattern | Why it was not selected |
|---|---|
| Strategy | There is no interchangeable algorithm; destinations differ in content and visuals, not in an algorithm selected at runtime. |
| Adapter | The landing page consumes its own typed model and no incompatible external interface. Museum API adaptation remains a backend concern. |
| Singleton | Global landing state is unnecessary and would make tests and future multiple renders harder. |
| Factory Method / Abstract Factory | Preview instances are static React elements, not object families with varying construction rules. |
| Decorator | The page does not need to attach optional behavior to destination objects dynamically. |
| Template Method | The repeated destination layout is composition plus data mapping; it has no algorithm skeleton with overridable steps. |
| Facade | Router links already expose the minimal navigation interface. |
| Mediator | `HomePage` coordinates only one child interaction; a mediator would merely rename that callback. |
| State | A discriminated ID and reducer are sufficient; state-specific classes would add indirection without behavior. |
| Observer | React's rendering model already observes reducer state; no domain observer was added. |
| Flyweight | Existing facade SVG components are reused, but there is no large population of objects whose intrinsic state requires flyweight sharing. |
| Prototype | No expensive or configured object is cloned. Immutable content records are clearer. |

