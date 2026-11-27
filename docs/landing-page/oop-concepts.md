# OOP concepts — landing page

## Important implementation context

The frontend uses TypeScript and functional React. OOP concepts therefore
appear mainly through typed abstractions, module boundaries, component
contracts, and encapsulated state transitions rather than through a large
class hierarchy. This is intentional: adding classes solely to demonstrate
syntax would make the feature less idiomatic and more coupled.

## Encapsulation

**Where:** `src/landing/controller.ts` and `DestinationShowcaseProps` in
`src/components/landing/DestinationShowcase.tsx`.

**How:** the selected destination is changed only by
`reduceLandingState`. The showcase receives `activeId` and `onSelect`; it does
not know whether the parent uses `useReducer`, `useState`, or another state
store. Its internal preview components are not exported.

**Why:** the reducer invariant and detailed preview implementation can change
without changing callers. Tests exercise the public reducer contract rather
than component internals.

## Abstraction

**Where:** `LandingDestination`, `LandingDestinationId`, and
`MissionPillar` in `src/landing/content.ts`; `DestinationShowcaseProps` in the
showcase view.

**How:** a destination is represented by the fields the landing page needs —
identity, copy, action, and path — without exposing React elements or router
objects in the model. The showcase depends on that abstraction rather than on
three unrelated hardcoded link blocks.

**Why:** the same rendering pipeline handles every destination and makes the
model independently understandable and testable.

## Polymorphism

**Where:** MUI's polymorphic `component` prop in `HomePage` and
`DestinationShowcase`, for example `ButtonBase component={RouterLink}` and
`Typography component="a"`.

**How:** the same presentational component renders with different underlying
element behavior while retaining its styled interface and TypeScript contract.
`ButtonBase` becomes a router-aware anchor, and `Typography` can become a
heading, paragraph, or native anchor as required by semantics.

**Why:** this provides navigation semantics without duplicating the design
system styles. No custom subtype hierarchy is needed.

**Deliberate limit:** the three preview visuals are selected with a union type
and explicit branches. They are not modeled as subclasses implementing a
virtual `render` method because they contain no interchangeable domain
algorithm. If previews later gain independent lifecycle behavior, a component
registry could provide a stronger form of subtype polymorphism.

## Inheritance

**Not used deliberately.** `HomePage`, `DaikiPage`,
`DestinationShowcase`, and `LandingMuseumCarousel` do not inherit from a
base page or base component. They compose React components and share the MUI
theme.

The rejected alternative was a `BaseLandingSection` or class hierarchy for
the three previews. It would couple unrelated layouts to inherited structure,
make prop contracts less explicit, and conflict with the project's functional
React style. Theme reuse and component composition provide the useful sharing
without the fragile-base-class trade-off.

## Relationship to MVC

Encapsulation and abstraction support the selected MVC pattern:

- model interfaces abstract the editorial domain;
- the controller encapsulates state transitions;
- view components compose polymorphic MUI elements;
- inheritance is intentionally absent because composition is the better reuse
  mechanism for this UI.

