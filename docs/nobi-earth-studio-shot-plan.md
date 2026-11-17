# NOBI — Egypt to Cairo camera shot plan

**Purpose:** a short Earth Studio camera move for the NOBI website intro.  
**Target duration:** 6.5 seconds  
**Suggested project setup:** 1920 × 1080, 30 fps, 195 frames  
**Route:** global / North Africa → Egypt overview → Cairo city approach

> This is a shot plan, not an Earth Studio project file. No `.esp` is included because Google documents `.esp` as a native project exported from Earth Studio, but does not publish a supported authoring schema or generator. A hand-written file could not be validated as importable here.

## Camera path

Use a restrained left-to-right search in the opening second, then commit to Egypt. Do not orbit or spin the camera. Keep heading changes subtle and let the altitude move create the scale change.

| Frame | Time | Camera target | Suggested altitude | Tilt | Heading | Beat |
|---:|---:|---|---:|---:|---:|---|
| 0 | 0.0s | 23.5° N, 30.0° E | 14,000 km | 0° | -4° | High global view; Egypt sits just below center |
| 30 | 1.0s | 24.0° N, 28.5° E | 11,000 km | 0° | +2° | Small search drift; no full rotation |
| 72 | 2.4s | 26.8206° N, 30.8025° E | 2,200 km | 8° | 0° | Pull out to frame Egypt as a whole |
| 132 | 4.4s | 30.0444° N, 31.2357° E | 260 km | 28° | 0° | Lock onto Cairo and descend |
| 168 | 5.6s | 30.0444° N, 31.2357° E | 85 km | 48° | -3° | Cairo 3D-city approach, if detailed 3D data is available |
| 195 | 6.5s | 30.0444° N, 31.2357° E | 75 km | 48° | 0° | Settle and hold for the cut |

These altitude values are starting points, not guaranteed framing values. Adjust them in the Earth Studio viewport to keep Egypt readable at the country beat and Cairo recognizable at the final beat. If the Cairo 3D data looks soft, pull back slightly rather than pushing closer.

## Motion and timing

- **0.0–1.0s:** a short lateral scan over the globe. Keep it subtle; no spin.
- **1.0–2.4s:** accelerate into the Egypt overview.
- **2.4–4.4s:** continue the descent and shift the target from Egypt's center to Cairo.
- **4.4–5.6s:** tilt into the city approach and settle.
- **5.6–6.5s:** hold the final Cairo framing; the website overlays `THE WORLD IS YOURS` and performs the transition into the storefront.

For the large altitude change, enable **Animation → Advanced → Logarithmic Altitude** before tuning the move. Because this shot has several keyframes, inspect the Curve Editor for bumps and smooth the middle keyframes. Keep latitude and longitude easing aligned so the camera path does not kink.

## Earth Studio setup and export

1. Open [Google Earth Studio](https://earth.google.com/studio/).
2. Create a blank project and set the duration to 195 frames at 30 fps.
3. At each frame in the table, position the camera and use **Keyframe All Attributes**. Latitude, longitude, and altitude are linked position attributes.
4. Use a gentle ease-in/ease-out. Smooth the middle camera-path keyframes; avoid abrupt heading changes.
5. If available, enable the 3D Cities view for the final Cairo beat. Keep the tilt around 40–60° only if the imagery remains clear.
6. Render a clean 16:9 clip. Keep the NOBI typography and lime accent in the website layer so the brand treatment stays crisp and editable.
7. Export the native project using **File → Export Project** (`.esp`). Reopen it with **File → Import** to confirm that the exported project is valid before sharing it.

## Brand treatment and attribution

- Use near-black / charcoal for the website overlay.
- Reserve `#d6ff3a` for the Cairo target, one small rule, and the word **YOURS**.
- Keep `THE WORLD IS YOURS` exact; do not add punctuation.
- Keep the Google Earth and any imagery-provider attribution visible on every rendered frame. Do not crop, cover, or remove it. Check Google's [Attribution requirements](https://earth.google.com/studio/docs/attribution/) before publishing Earth Studio footage, especially for commercial use.

## Current website fallback

The React intro is a stylized CSS/SVG camera treatment with an Egypt outline and a Cairo target. It is intentionally not presented as real satellite footage. Replace the background treatment with a properly rendered and attributed Earth Studio clip only after the native project has been created and verified in Earth Studio.
