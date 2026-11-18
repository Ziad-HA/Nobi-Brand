# NOBI Earth Studio intro

- Native project: `NOBI_Egypt_to_Cairo_Intro.esp`
- Format: Google Earth Studio project JSON, modelVersion 17
- Sequence: Egypt overview → Cairo approach
- Output target: 1920×1080, 30 fps, 195 frames (6.5 seconds)

## Render and connect to the website

1. Open Google Earth Studio and import the `.esp` project.
2. Review the framing and adjust the camera if needed. Earth imagery and 3D city detail depend on Earth Studio's available imagery.
3. Render a 16:9 video and keep all required Google Earth attribution visible.
4. Export the render as `nobi-egypt-cairo.mp4`.
5. Place the MP4 at `public/earth-studio/nobi-egypt-cairo.mp4`. The website should use the rendered MP4, never the `.esp` file directly.

The website intro (`src/components/Intro.jsx`) plays `nobi-egypt-cairo.mp4` (compressed render, poster included) and layers the NOBI typography on top of it. The Google Earth attribution baked into the footage is left uncovered.
