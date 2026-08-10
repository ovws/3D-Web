# GameShell specification

## Overview

- Target file: `app/page.tsx`
- Runtime entry: `public/game/index.html`
- Interaction model: keyboard, pointer, touch, gamepad, time, and physics driven

## Structure

- Fixed full-viewport shell.
- Same-origin full-viewport frame containing the standalone 3D runtime.
- Dark radial fallback background matching the source page.
- Minimal loading veil that disappears when the runtime document loads.
- An official-scene compatibility fallback appears only when neither WebGPU nor WebGL is available.

## Styling

- Shell background: radial gradient from `#2b2330` to `#1d1721`.
- Frame: `100% × 100dvh`, borderless, block layout.
- Loading veil: centered compact mark, uppercase status label, and animated two-pixel progress line.

## Responsive behavior

- Desktop, tablet, and mobile use the full visual viewport without scrollbars.
- Input behavior and in-game UI adaptation are owned by the embedded runtime.

## Accessibility

- The frame has a descriptive title.
- A JavaScript-disabled fallback message is included.
- Reduced-motion preferences disable wrapper animation.
