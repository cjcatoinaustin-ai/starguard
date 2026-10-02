# Starguard — Browser Edition

This is a standalone browser arcade rescue game with original art, the four supplied pilot portraits, and original electronic music. Unreal Engine and Visual Studio are not needed to play this edition.

## Play

Open `index.html` in a current version of Edge, Chrome, or Firefox. Keep the `assets` folder alongside it. Sound starts after your first click or key press, as required by browsers.

For a local web-server launch instead, serve this folder with any static HTTP server and open its local URL. The entire game is static HTML, CSS, JavaScript, images, and WAV files; it needs no backend or internet access. To publish it, upload the contents of this folder to any static web host. Use HTTPS for public hosting.

## GitHub Pages

The site can be published from the root of a GitHub repository. Keep `index.html`, the CSS and JavaScript files, `.nojekyll`, and the entire `assets/` folder together at the repository root. In the repository's **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. The published project URL will normally be `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

GitHub Pages publishes the game publicly, including the supplied pilot portraits and the personal dialogue in the JavaScript files. Browser high scores remain in each visitor's local storage; they are not shared through GitHub.

## Controls

| Action | Keyboard and mouse | Gamepad |
| --- | --- | --- |
| Choose pilot | Click a portrait, 1–4, or Left / Right on title | D-pad Left / Right |
| Launch / restart | Enter, Space, or button | Bottom face button |
| Thrust | WASD or arrow keys | Left stick |
| Hold boost | Shift while moving | Left trigger |
| Face left / right | Q / E | Left / Right shoulder |
| Fire | Space or hold the left mouse button in the playfield | Right trigger |
| Switch collected weapon | X | D-pad Up |
| Toggle automatic firing | F or Auto Fire button | — |
| Pilot power | R | B / right face button |
| Pause / resume | Escape or Pause / Resume button | Start button |
| Buy an upgrade after a wave | Click an upgrade or press 1–4 | Click an upgrade |
| Skip the hangar | Enter or Space | Bottom face button |
| Return to title | Button in pause menu; Tab on game-over screen | — |
| Sound on / off | Sound button | — |
| Spoken radio on / off | Voice button | — |

On phones and tablets, on-screen Left, Up, Down, Right, Boost, Turn, Pilot Power (★), Gun, and Fire buttons appear automatically. Hold a direction, Boost, or Fire button for continuous control; tap Turn to reverse the ship or Gun to switch weapons. A landscape orientation gives the widest view. To leave, return to the title from the pause menu or close the browser tab.

If your keyboard misses Space while two arrow keys are held, press **F** once before flying to enable automatic firing. Press F again to turn it off. This works around keyboards that cannot report that three-key combination.

## Mission

Fly over the looping landscape, collect green settlers, and descend over the landing pad at **Haven One** to rescue them. Fly close to another settler while carrying one to add them to the glowing tow chain. Most pilots carry three at once; Princess Nicole can carry four. Bigger rescue chains earn larger bonuses but slow the ship. Settlers run from nearby abductors and flash distress signals. Destroy a drone carrying a settler to release the captive; catch them in the air or collect them after they land. Rescued settlers cheer at Haven One. Each wave also has an optional rescue challenge for bonus points; its task and timer appear under the main objective.

In canyon sectors, hold Down to descend into the valley. The ship can now reach settlers on the canyon floor, and the view keeps that floor visible. Fly low over them to attach them to the tow chain, then climb out and return to Haven One.

Defeated raiders can leave glowing weapon pods. The first kill always drops one. Pods have bright beams and rings; approach one to see its name and effect on the HUD. Fly through a pod to equip its weapon and collect more ammo; duplicate pods refill that weapon. The **Fan Cannon** fires five bolts in a spread, the **Seeker Pair** launches two homing missiles, and the **Piercer** shoots through multiple raiders. New pods unlock **Twin Lasers** for rapid paired shots, **Plasma Bomb** for splash damage, and **Nova Burst** for an eight-way blast. These use limited volleys, shown at the top of the screen. The title screen has an expandable weapon stats guide. Press **X**, D-pad Up, or the touch **Gun** button to switch among stocked weapons and the unlimited Blaster. Empty weapons automatically return to the Blaster. Pods expire after 18 seconds and appear on radar.

Abductors, eight-way Starbursts, and the winged neon siege craft threaten the ship and Haven One. New alien types appear in later waves: pink **Interceptors** chase and fire aimed shots from wave 2, green **Spore Carriers** drop paired mines from wave 4, and violet **Phantoms** weave and fire twin bolts from wave 5. Starbursts and all three new types have distinct original neon SVG sprites and animated attack rings before firing. If the settlement's integrity reaches zero, the mission ends. Every third wave features a giant boss alien carrying two captives. Four original bosses appear in sequence: the **Dread Manta** (wave 3), **Void Serpent** (wave 6), **Prism Citadel** (wave 9), and **Eclipse Mother** (wave 12). Each has its own large neon art, movement, color, health bar, and projectile pattern; the sequence repeats at higher waves. Boss arrival gets a short warning; aim at the glowing core for extra damage. Each wave brings a timed Commander Vega objective and a terrain hazard: ion canyon updrafts, electric storms, or asteroid showers. The sky, mountains, and terrain glow change through four sector palettes. The radar shows the full world, the active hazard zone, and green 1UP pickups.

Each pilot has a different power with an 18-second cooldown:

- **C.J. — Pulse Burst:** Clears hostile shots and damages nearby enemies.
- **Michael — Overdrive:** Gives the ship a temporary speed and thrust boost.
- **Princess Nicole — Shield Trail:** Protects the bright-pink ship and catches hostile shots in its trail. She is the elite pilot, with the highest base speed, an extra starting shield, a wider rescue pickup area, and four seats.
- **Zachary — Tractor Field:** Extends pickup range and allows one extra passenger while active.

The game starts with 16 settlers, four lives, and a free shield (two for Nicole). A glowing green 1UP appears each wave; fly through it for an extra ship, up to six lives. At six lives it recharges a shield instead. Regular waves advance after 60 seconds and boss waves after 95 seconds, even if you have not found every raider. Clearing all enemies advances the wave sooner. At the end of each wave, the hangar offers one upgrade if you have enough points: **Thrusters** and **Turbo Drive** each have five levels that stack for faster flight, while shield cells and the rescue beam have three levels each. Hold Shift, the gamepad left trigger, or the touch Boost button while moving for a temporary speed burst; the HUD meter recharges when released. Upgrades last for the current run. The HUD shows the current Turbo Drive level. The game-over screen offers restart and pilot selection.

The score is enlarged in the flight HUD, with the saved top score beside it and on the title screen. At game over, a qualifying score prompts for one to three initials. The five best scores are stored in this browser's local storage and displayed on the game-over board. They are local to that browser profile and are not an online leaderboard.

Commander Vega appears in a compact upper-right radio panel after key mission events; the selected pilot always answers. Vega begins transmissions at least 12 seconds apart, and routine chatter is less frequent. The lines draw from shuffled dialogue pools to avoid immediate repetition. The original electronic music crossfades between flight, danger, boss, and menu loops as the action changes. Use the Sound button to mute it.

Vega also has pilot-specific banter: Nicole hears compliments, a joke about her FrouFrou commute in Austin, and one-time exchanges about makeup, Daddy's text and dinner taco, Whole Foods, an Amazon return, an H.E.B. curbside order, her diamond ring, Michael's football game, picking Zach up from Valor, and a video call with Kendra. New exchanges include her colloidal-silver joke after alien fire, a Facebook Marketplace detour, a Patrick Swayze lookalike, getting to church, a foot soak, noisy passengers, a Brinks Home Security alarm at FrouFrou, aesthetician work, frown lines and Botox, date night, Daddy making dinner, and Daddy spoiling her. These exchanges play in a shuffled order and at varying intervals each run. Michael gets American football calls; Zachary hears jokes about his Valor Flight School training and VR reflexes.

Vega opens each run with a short mission briefing, followed by the chosen pilot's response. Radio dialogue is **spoken aloud by default** in browsers that support the Web Speech API. The pilot waits until Vega's spoken line finishes; a safety timeout handles browsers that do not signal speech completion. The Voice button turns speech off. Starguard requests male English voices for Vega, C.J., Michael, and Zachary and a female English voice for Nicole; Chrome uses installed system voices, so the exact voices vary by device. If a matching voice is unavailable, the browser uses its default voice with different pitch settings. Sound Off mutes the speech too.

## Files

- `index.html` — game page and menus
- `styles.css` — responsive layout
- `improvements.css` — radio panel, viewport fitting, and touch control layout
- `game.js` — gameplay, rendering, input, and audio
- `dialogue.js` — expanded original radio line pools
- `assets/` — original game art, four new alien SVGs, four boss SVGs, portraits, and WAV audio

This is a browser implementation using Canvas, HTML audio, and Web Audio APIs.
