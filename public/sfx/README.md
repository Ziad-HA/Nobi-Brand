# Sound effects

Drop your audio files in this folder, then make sure the names match `SOUNDS` at the
top of `src/lib/sfx.js` (that file is also where you set each sound's volume).

| File (default name)  | Plays when                                                    |
| -------------------- | ------------------------------------------------------------- |
| `hover.mp3`          | mouse enters a product card or lookbook photo                 |
| `click.mp3`          | a card or photo is pressed                                    |
| `orbit-spin.mp3`     | lookbook photos start spinning (on the way in and way out)    |
| `orbit-settle.mp3`   | lookbook photos lock into place                               |
| `toggle.mp3`         | the Sound button in the nav is switched on                    |

Notes
- Keep them short (under about 1 second for hover and click) and small (a few KB).
- mp3, ogg and wav all work. If you use another extension, change it in `sfx.js`.
- Sound is off until the visitor turns it on with the Sound button in the nav.
- A missing file is simply silent, so you can add them one at a time.
- Want a sound somewhere else? `import { sfx } from '../lib/sfx'` then `sfx.play('hover')`,
  and add a new entry to `SOUNDS`.
