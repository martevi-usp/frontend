# Programming and OOP practices — landing page

## Scope

This report covers the landing page, its three destinations, and the new test
support. It excludes the museum API, artwork search, gallery room, and jigsaw
implementation except where the landing page links to those existing features.

## Practices applied to concrete code

| Practice | Where it is applied | Why it matters here |
|---|---|---|
| Single Responsibility Principle | `src/landing/content.ts` owns editorial data; `src/landing/controller.ts` owns selection state; `HomePage` composes the page; `DestinationShowcase` renders destination navigation. | Copy, state transitions, page structure, and detailed presentation can change independently. |
| Separation of concerns | `AppRoutes` in `src/App.tsx` contains routing, while `HomePage` contains no route table and the controller contains no JSX. | Route changes do not leak into interaction rules, and the reducer can be tested without React or a browser. |
| Low coupling through typed contracts | `DestinationShowcaseProps`, `LandingDestination`, and `LandingDestinationId`. | The parent view passes data and a callback rather than exposing reducer details to the child component. |
| High cohesion | All landing-specific UI is under `src/components/landing/`; all landing state/model code is under `src/landing/`. | Each directory has one reason to change and unrelated museum/search code remains untouched. |
| Immutable data | `MISSION_PILLARS` and `LANDING_DESTINATIONS` are `readonly` arrays declared `as const`. The reducer returns a new object only for a real selection change. | The view cannot accidentally alter shared content, and state transitions are predictable. |
| Consistent naming | `LandingDestination`, `activeDestination`, `destination-selected`, `DestinationShowcase`, and route `/tarefa-do-daiki`. | Names describe the same domain concept across model, controller, view, and tests. |
| Composition over inheritance | `HomePage` composes `LandingMuseumIllustration` and `DestinationShowcase`; `AppRoutes` composes route elements. | React composition fits this UI better than a base-page hierarchy and avoids inherited state. |
| Data-driven rendering | `MISSION_PILLARS.map(...)` and `destinations.map(...)`. | Repeated sections share one rendering path instead of duplicated JSX. |
| Accessible interaction | Each destination is a real router link; `onFocus` mirrors `onMouseEnter`; the list keeps `list`/`listitem` semantics; headings use `aria-labelledby`; the preview uses `aria-live`. | Keyboard and assistive-technology users can reach the same destinations as pointer users. |
| Responsive design | `HomePage`, `DestinationShowcase`, and `LandingMuseumIllustration` use MUI breakpoint objects and fluid `clamp(...)` type sizes. | The same content hierarchy adapts from phone to desktop without separate markup. |
| Reduced-motion support | Custom animations and transitions in `HomePage`, `LandingMuseumIllustration`, and `DestinationShowcase` define `prefers-reduced-motion: reduce` fallbacks. | Motion is enhancement rather than a requirement. |
| Reuse of the design system | Components use MUI semantic tokens such as `text.primary`, `primary.main`, `divider`, `background.default`, and existing typography variants. `MuseumBuilding` is reused from the atrium. | The landing page stays consistent with the paper-and-ink system without duplicating colors or facade assets. |
| Boundary behavior | The wildcard route in `AppRoutes` redirects unknown paths to `/`; `/tarefa-do-daiki` is an explicit route rather than an unhandled link. | Every landing-page link has a defined destination and mistyped URLs have a safe fallback. |

## SOLID assessment

- **SRP:** applied directly through the model/controller/view split described
  above.
- **OCP:** partially applied. New text rows can be added to
  `LANDING_DESTINATIONS`, but a genuinely new preview visual still requires a
  corresponding branch in `DestinationPreview`. A factory or registry would
  only be justified after more preview types exist.
- **LSP:** not applicable because this implementation defines no class
  hierarchy.
- **ISP:** the small `DestinationShowcaseProps` contract gives the view only
  the destination data, active identifier, and selection callback it needs.
- **DIP:** applied at the component boundary through props, but not through a
  dependency-injection framework. Introducing one for static content and a
  reducer would add ceremony without replacing an unstable dependency.

## Error handling at system boundaries

The landing page performs no data fetch, parsing, or persistence, so it does
not invent error states for operations that cannot fail. Backend warm-up remains
in the existing `App` effect, outside the landing view. Routing is the only new
boundary: every requested path is registered in `AppRoutes`, and the existing
wildcard redirect remains the fallback.

