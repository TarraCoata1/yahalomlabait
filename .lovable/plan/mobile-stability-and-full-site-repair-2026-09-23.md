# Mobile stability and full-site repair

## Scope
- Diagnose the current runtime failure from live server/browser evidence, then fix the underlying shared data or rendering path rather than masking the error page.
- Repair shared mobile structure: root page flow, header/menu, cart drawer, footer, cookie panel, accessibility menu, WhatsApp/accessibility/back-to-top controls, RTL direction, safe areas, and horizontal overflow.
- Remove unnecessary empty vertical space without changing the brand, content, desktop design, or existing commerce behavior.
- Harden shared storefront data loading so a temporary settings/catalog failure cannot crash the complete page.

## Verification
- Exercise every public route and the admin entry at 320, 375, 390, 414, and 430px, plus desktop.
- Check HTTP/runtime/console/hydration errors, missing assets, horizontal overflow, footer placement, navigation, theme, cart, and floating controls.
- Validate representative interactions and inspect screenshots at 390px.
- Confirm all content routes retain unique metadata and report the final automated build result.

## Technical details
- Keep the single root layout and one footer; no duplicate page shell will be introduced.
- Use logical RTL positioning and `env(safe-area-inset-bottom)` for viewport-fixed controls.
- Use dynamic viewport constraints and internal scrolling for panels that can exceed small screens.
- Preserve existing routes, backend schema, branding, and business content.
