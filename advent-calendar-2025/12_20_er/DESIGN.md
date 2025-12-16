# Escape Room - Pixel Art Horror Game

## Overview
A pixel art escape room that starts innocent and turns into horror. Player is Fede, cleaning his own apartment, who discovers a hidden passage to a serial killer's adjacent apartment.

---

## STORY

**Setup**: Fede is cleaning his apartment. Normal Sunday. Front door auto-locked behind him, but that's fine - key is somewhere. His boyfriend Billy (lives in another country) texts him occasionally via Telegram.

**Twist**: Behind the fridge is a passage to a connected apartment. The neighbor is a serial killer - a normal-looking blond twink. The apartment contains a horrific dungeon.

**Climax**: The killer comes home. Chase sequence to escape through the killer's front door.

---

## AESTHETICS

- Pixel art style (like Lucky Pixel Casino - 12_15)
- "Press Start 2P" font
- Top-down 2D view
- Dark but not too dark initially
- Lighting shifts as tension builds

---

## CHARACTERS

### Fede (Player)
- Cleaning his apartment
- Speaks to himself in Spanish (Argentinian - vos form, no heavy modisms)
- Mutters observations, nothing on-the-nose
- Examples:
  - "Qué raro..."
  - "De dónde viene ese ruido?"
  - "Hace frío acá..."
  - "Qué carajo?"

### Billy (Boyfriend)
- Lives in another country
- Texts via Telegram throughout the game
- Format: [Telegram icon] Billy: mensaje
- Fede stops for 0.5s and auto-responds
- Billy's tone: worried, escalates over time

**Billy's Messages (progression):**
1. "Cómo va la limpieza?"
2. "Todo bien?"
3. "Fede?"
4. "Por qué no contestás?"
5. "Me estoy preocupando"
6. "Contestame por favor"
7. "Voy a llamarte"
8. "Fede contestame"

### The Killer
- Blond twink, attractive, normal-looking
- That's the horror - he looks like anyone
- Comes home during the game
- Humming, carrying groceries (mundane)
- Fast when chasing
- If he spots Fede: "Ah... un vecino."

---

## GAME MECHANICS

### Movement
- Arrow keys or WASD
- Player sprite visible from above

### Inventory
- Press E near items to pick up
- Press I or ESC to open inventory
- Select item to "equip"
- Equipped item shown in HUD

### Interaction
- Press SPACE to use equipped item on nearby objects
- **Interactable objects are NOT visually obvious**
- Player must experiment

### Narration Rules
- NO second person ("You discover...")
- Show, don't tell
- Fede's muttered Spanish only
- Environmental storytelling

---

## APARTMENT LAYOUT

### FIRST FLOOR (Fede's Apartment)
```
+------------+------------------+
|            |                  |
|  BATHROOM  |     OFFICE       |====[SHARED
|            |                  |     BALCONY]
+------------+------------------+
|            |                  |
|  HALLWAY   |     BEDROOM      |====[SHARED
|            |                  |     BALCONY]
|  (STAIRS)  +------------------+
|            |                  |
[DOOR]       |     TOOLS        |
(LOCKED)     |    (open area)   |
+------------+------------------+
```

### SECOND FLOOR (Fede's Apartment)
```
+--------+----------+---------------------------+
| HUGE   |          |  PIANO    |    TV        |
| WINDOW | SCENARIO |           |              |
|        |          |-----------+--------------|
|        |          |         SOFA             |
+--------+          |--------------------------|
|BALCONY |          |    KITCHEN ISLAND        |
| DOOR   |          |--------------------------|
|        | (STAIRS) |       KITCHEN            |===[BALCONY]
+--------+----------+-----+--------------------+
                          |
                      [FRIDGE]
                          |
                    [HIDDEN PASSAGE]
                          |
                          v
              KILLER'S APARTMENT
```

### KILLER'S APARTMENT
- Accessed through back of fridge
- Storage room → Living space → THE ROOM
- Front door = ESCAPE ROUTE
- Layout TBD

---

## PUZZLE DESIGN

### First Floor Tools/Items:
1. **Screwdriver** - Tool area, on workbench
2. **Small key** - Hidden in bedroom plant pot
3. **Flashlight** - Bathroom cabinet (needs small key)

### First Floor Puzzles:

**TOOL AREA:**
- Screwdriver visible on workbench (starter item)
- Toolbox is locked (combination lock - code elsewhere)

**BEDROOM:**
- Plant pot contains small key (need to interact with it)
- Closet has combination lock (4 digits)
- Nightstand drawer: note with hint
- Under bed: nothing suspicious (it's Fede's apartment)

**BATHROOM:**
- Cabinet locked (needs small key)
- Inside: flashlight
- Mirror: use flashlight → reveals numbers (UV ink?) → closet code

**OFFICE:**
- Computer on desk (password protected)
- Desk drawer: some papers, nothing useful yet
- Bookshelf: normal books

**HALLWAY:**
- Front door: LOCKED, no key found here
- Fede: "Qué raro, dónde dejé la llave?"

### Second Floor (Later):
- Fridge passage discovery
- More tools needed
- Sounds from wall get louder

---

## SOUND DESIGN

### Main Apartment (First Floor):
- Ambient: quiet, occasional outside sounds
- Light music? Or silence

### Main Apartment (As you progress):
- Distant thump from walls
- Muffled sounds
- Fede dismisses: "Estos vecinos..."

### Near Fridge:
- Cold draft sound
- Humming of fridge louder than normal
- Something... else?

### Killer's Apartment:
- Dead silence (soundproofed)
- Your own footsteps
- Eventually: keys in door, humming

### Chase:
- Heart beat
- Fast footsteps
- Killer's voice

---

## ENDINGS

1. **ESCAPE** - Reach killer's front door, get out
2. **BILLY ENDING** - Billy calls during chase, distraction helps
3. **CAUGHT** - Killer catches Fede, fade to black
4. **HIDE SUCCESS** - Hide, killer gives up, sneak out
5. **HIDE FAIL** - Hide, killer finds you

---

## TELEGRAM INTEGRATION

Visual: Speech bubble with Telegram icon
```
[TG icon] Billy: Cómo va la limpieza?
```

Fede stops moving for 0.5s
Response shown briefly: "Bien, ya casi termino"
Then continues

Timing:
- Message 1: 30 seconds in
- Message 2: After finding first item
- Message 3: After first puzzle solved
- Message 4+: Based on progression/time

---

## IMPLEMENTATION PHASES

### Phase 1: First Floor Demo
- [x] Layout design
- [ ] Pixel art tiles
- [ ] Player movement
- [ ] 2-3 items to collect
- [ ] 1-2 simple puzzles
- [ ] Inventory system
- [ ] Basic interaction

### Phase 2: Full First Floor
- [ ] All rooms functional
- [ ] All puzzles
- [ ] Telegram messages
- [ ] Fede's dialogue

### Phase 3: Second Floor
- [ ] Kitchen and fridge
- [ ] Passage discovery
- [ ] Sound design

### Phase 4: Killer's Apartment
- [ ] Layout
- [ ] Horror elements
- [ ] Chase sequence
- [ ] Multiple endings

---

## NOTES

- Keep main apartment INNOCENT - it's Fede's place
- All horror is in killer's apartment
- Tension builds through sounds, not visuals (at first)
- Billy's messages add emotional stakes
- The killer being attractive/normal is the point
