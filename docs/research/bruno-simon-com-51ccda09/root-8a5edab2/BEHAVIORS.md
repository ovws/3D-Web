# Behaviors

## Desktop

- `WASD` or arrow keys: drive.
- `Shift`: boost.
- Left `Control` or `B`: brake.
- `Space`: jump.
- `Enter`: interact.
- `M`: map.
- `L`: mute.
- `T`: post a whisper; live multiplayer messaging remains offline in this clone.
- `R`: respawn.
- Number keys or numpad: hydraulics.
- Left-click drag: orbit the camera.
- `H`: horn.

## Touch

- One finger: move the vehicle.
- Two fingers: move and zoom the camera.
- Tap the vehicle: jump.

## Responsive behavior

- The canvas and wrapper always fill the visual viewport.
- The original interface switches control affordances based on detected keyboard, touch, or gamepad input.
- Menu typography and button dimensions reduce at 520 px and 440 px breakpoints.

## Environment limitation during extraction

The inspection browser exposed the complete interface DOM and assets but could not initialize a WebGL context. Scene fidelity was therefore verified against the project's current open-source implementation and official current visual assets.
