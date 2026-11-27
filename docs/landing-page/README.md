# Landing page implementation dossier

This directory documents only the landing-page work introduced at `/`. It is
intended as source material for the broader course reports and deliberately
does not make claims about practices, patterns, or tests in the rest of the
project.

- [Programming and OOP practices](programming-practices.md)
- [Design-pattern catalog and decision record](design-patterns.md)
- [Software test report](software-tests.md)
- [OOP concepts](oop-concepts.md)

## Implementation map

| Responsibility | Source |
|---|---|
| Landing route and route composition | `src/App.tsx` (`AppRoutes`) |
| Main landing-page view | `src/pages/HomePage.tsx` (`HomePage`) |
| Placeholder destination | `src/pages/DaikiPage.tsx` (`DaikiPage`) |
| Editorial model | `src/landing/content.ts` |
| Interaction controller | `src/landing/controller.ts` (`reduceLandingState`) |
| Interactive destination view | `src/components/landing/DestinationShowcase.tsx` |
| Hero museum carousel | `src/components/landing/LandingMuseumCarousel.tsx` |
| Unit tests | `tests/unit/landingController.test.ts` |
| Integration tests | `tests/integration/landingRoutes.test.tsx` |

