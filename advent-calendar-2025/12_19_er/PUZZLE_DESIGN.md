# El Departamento - Puzzle Design Document

## Overview

Fede is cleaning his apartment on a normal Sunday. His front door auto-locked behind him, but that's fine - the key is somewhere. His boyfriend Billy texts him occasionally via Telegram.

Behind the fridge is a passage to a connected apartment. The neighbor is a serial killer - a normal-looking blond twink. The apartment contains disturbing evidence.

---

## Endings Summary

| Ending | Name | Trigger |
|--------|------|---------|
| A | ESCAPE | Unlock door in time, escape cleanly |
| B | REVENGE | Push furniture on killer, take knife, kill him |
| C | CAUGHT | Too slow fumbling with keys at door |
| D | DISCOVERED | Exit from hiding before killer enters bathroom |

Endings C and D both lead to the basement scene.

---

## Full Puzzle Flow

```
╔════════════════════════════════════════════════════════════════════════════╗
║                         PHASE 1: FEDE'S APARTMENT                          ║
║                            "Un domingo normal"                             ║
╚════════════════════════════════════════════════════════════════════════════╝

                        [START: Front door locked]
                         "Donde deje la llave?"
                                    |
            +-----------------------+------------------------+
            |                                                |
            v                                                v
    [SCREWDRIVER]                                    [PUSH PLANT]
    (tools area, visible)                            (bedroom)
            |                                                |
            |                                                v
            |                                        [SMALL KEY]
            |                                                |
            |                                                v
            |                                  [OPEN BATHROOM CABINET]
            |                                                |
            |                                                v
            |                                        [FLASHLIGHT]
            |                                                |
            |                                                v
            |                                  [USE ON BATHROOM MIRROR]
            |                                                |
            |                                                v
            |                                    [REVEALS CODE: 1987]
            |                                                |
            |                                                v
            |                                  [ENTER CODE ON TOOLBOX]
            |                                                |
            |                                                v
            |                                  [MAINTENANCE DOCUMENT]
            |                                   Shows fridge panel
            |                                                |
            +------------------------+-----------------------+
                                     |
                                     v
                   +-------------------------------------+
                   | REQUIRES: Screwdriver + Document   |
                   +-------------------------------------+
                                     |
                                     v
                       [GO TO 2ND FLOOR - KITCHEN]
                                     |
                                     v
                       [USE SCREWDRIVER ON FRIDGE]
                         Back panel has screws
                                     |
                                     v

╔════════════════════════════════════════════════════════════════════════════╗
║                      PHASE 2: NEIGHBOR'S APARTMENT                         ║
║                           "Algo esta mal"                                  ║
╚════════════════════════════════════════════════════════════════════════════╝

                                     |
                                     v
                         [ENTER THROUGH FRIDGE]
                           (neighbor's kitchen)
                                     |
                                     v
                       [EXPLORE - NO TIME LIMIT YET]
                                     |
             +-----------------------+-----------------------+
             |                       |                       |
             v                       v                       v
       [KITCHEN]               [LIVING ROOM]            [HALLWAY]
             |                       |                       |
             v                       v                       v
       - Multiple wallets      - Polaroids on wall     - Front door LOCKED
       - Drawer: duct tape,    - Newspaper clippings   - Empty key hook
         zip ties              - Push coffee table     - Metal box: empty
       - Dark stains             (nothing under)
                                     |
                                     v
                               [FIND BEDROOM]
                                     |
                                     v
                             [EXPLORE BEDROOM]
                          - Unmade bed, stained sheets
                          - Nightstand: empty
                          - Closet: clothes in many sizes
                                     |
                                     v
                           [INTERACT WITH BED]
                            "Hay espacio..."
                                     |
                                     v
                           [HIDE UNDER BED]
                                     |
                                     v
                     ================================
                             5 SECONDS PASS
                          (screen slowly darkens)
                     ================================
                                     |
                                     v
                   +-----------------------------------+
                   |     AUDIO SEQUENCE (NO VISUALS)  |
                   |                                   |
                   |  1. Key in lock: CLICK           |
                   |  2. Door opens: CREAK            |
                   |  3. Footsteps: slow, casual      |
                   |  4. Humming: cheerful tune       |
                   |  5. Footsteps continue...        |
                   |  6. Keys dropped: CLUNK          |
                   |  7. Footsteps resume...          |
                   |  8. Bathroom door: CLOSE  <----- SAFE TO EXIT
                   |  9. Water running                |
                   |                                   |
                   +-----------------------------------+
                                     |
                                     |
          +--------------------------+---------------------------+
          |                          |                           |
          v                          v                           v
    [EXIT DURING                [EXIT DURING              [EXIT AFTER
     STEPS 1-5]                  STEPS 6-7]               STEP 8+]
          |                          |                           |
          v                          v                           v
    Killer hasn't              Killer is in              Killer is in
    dropped keys yet           living room               bathroom
          |                          |                           |
          +------------+-------------+                           |
                       |                                         |
                       v                                         v
                 ===========                           [KEYS ON TABLE]
                  ENDING D                             (bloody, visible)
                "DISCOVERED"                                     |
                 ===========                                     |
                       |                                         v
                       v
               [FADE TO BLACK]
                       |
                       v
               [BASEMENT SCENE]


╔════════════════════════════════════════════════════════════════════════════╗
║                         PHASE 3: THE ESCAPE                                ║
║                           "Salir de aca"                                   ║
╚════════════════════════════════════════════════════════════════════════════╝

                   (continuing from EXIT AFTER STEP 8+)
                                     |
                                     v
                           [EXIT FROM UNDER BED]
                                     |
                                     v
                           [GO TO LIVING ROOM]
                                     |
                                     v
                     [TABLE: BLOODY KEYS now visible]
                          (keyring with 5 keys)
                                     |
                                     v
                             [PICK UP KEYS]
                                     |
                                     v
                     ================================
                           BATHROOM DOOR OPENS
                     ================================
                                     |
                                     v
                   +-----------------------------------+
                   |         KILLER APPEARS            |
                   |                                   |
                   |    - Blond twink                  |
                   |    - Smiles slowly                |
                   |    - Takes out bloody knife       |
                   |    - Moves VERY slowly            |
                   |    - Says nothing                 |
                   |                                   |
                   +-----------------------------------+
                                     |
                   +-----------------+-----------------+
                   |                                   |
                   v                                   v
           [RUN TO DOOR]                      [PUSH FURNITURE]
                   |                                   |
                   v                                   v
           (see KEYS MINI-GAME)               [FURNITURE HITS KILLER]
                                                       |
                                                       v
                                               [KILLER FALLS/FAINTS]
                                                       |
                                                       v
                                               [KNIFE ON FLOOR]
                                                       |
                                               +-------+-------+
                                               |               |
                                               v               v
                                        [PICK UP KNIFE]  [JUST LEAVE]
                                               |               |
                                               v               v
                                        [USE ON KILLER]  ===========
                                               |          ENDING A
                                               v          "ESCAPE"
                                         ===========     ===========
                                          ENDING B
                                         "REVENGE"
                                        (fade to black,
                                         sounds only)
                                         ===========
```

---

## Keys Mini-Game (At Door)

```
        [REACH DOOR - INTERACT WITH E]
                        |
                        v
        +---------------------------------------+
        |           KEYS OVERLAY                |
        |                                       |
        |    +-------------------------+        |
        |    |                         |        |
        |    |    [KEYRING VISUAL]     |        |
        |    |    Canvas-drawn:        |        |
        |    |    - Metal ring         |        |
        |    |    - 5 different keys   |        |
        |    |    - Current key on top |        |
        |    |    - Pixel art style    |        |
        |    |                         |        |
        |    +-------------------------+        |
        |                                       |
        |    [E] Probar    [Z] Rotar            |
        |                                       |
        +---------------------------------------+
```

### Key Designs (pixel art, distinct shapes)

| Key | Appearance | Result |
|-----|------------|--------|
| 1 | Small brass, simple teeth | "No..." |
| 2 | Long silver, ornate handle | "No, no..." |
| 3 | Rusty/brown, chunky | "Dale, dale..." |
| 4 | Black modern, car key style | "Vamos, vamos!" |
| 5 | Gold fancy, old door key | WORKS |

Order is fixed - always key 5 that works.

### Rotation Animation

- Ring rotates 72 degrees (360/5 keys)
- Keys swing with slight momentum
- Metal jingle sound
- ~0.3s animation duration
- Easing: ease-out

### Timing Pressure

| Keys tried | Killer distance | Tension |
|------------|-----------------|---------|
| 0 (arrived) | Far | Low |
| 1 wrong | Closer | Medium |
| 2 wrong | Halfway | High |
| 3 wrong | Close | Very high |
| 4 wrong | Almost there | Panic |
| 5 correct | -- | Escape! |

If player is too slow between rotations/tries, killer catches them -> Ending C.

---

## Basement Scene (Endings C & D)

```
        [FADE TO BLACK]
                |
                v
+-----------------------------------+
|        NEW SCENE:                 |
|       BASEMENT ROOM               |
|                                   |
|  - Dim red lighting               |
|  - Player tied to table           |
|  - First-person view              |
|  - Chains, tools on walls         |
|                                   |
+-----------------------------------+
                |
                v
+-----------------------------------+
|    KILLER APPROACHES              |
|                                   |
|  - Walking slowly                 |
|  - Same smile                     |
|  - Knife in hand                  |
|  - Moving toward crotch           |
|                                   |
+-----------------------------------+
                |
                v
        [FADE TO BLACK]
                |
                v
         ===========
         ENDING C/D
         ===========
                |
                v
        [RESTART OPTION]
```

---

## Billy's Telegram Messages

### Format

```
+-----------------------------+
| [TG icon] Billy:            |
| "message here"              |
+-----------------------------+
```

- Appears top of screen
- Fede stops for 0.5s
- Auto-responds (brief flash)
- Then continues

### Phase 1: Fede's Apartment

| Trigger | Billy | Fede's Reply |
|---------|-------|--------------|
| 30 sec in | "Como va la limpieza?" | "Bien, recien arranco" |
| Get flashlight | "Encontraste algo interesante?" | "Jaja no, polvo nomas" |
| Open toolbox | "No estas con el vecino no? Jaja" | "Jaja no, por?" |
| Find document | "Ya casi?" | "Si, un toque mas" |

### Phase 2: Neighbor's Apartment

| Trigger | Billy | Fede's Reply |
|---------|-------|--------------|
| Enter through fridge | "Todo bien?" | (no reply) |
| 20 sec inside | "Fede?" | (no reply) |
| Find first clue | "Por que no contestas?" | (no reply) |

### Phase 3: Hiding / Killer Arrives

| Trigger | Billy | Fede's Reply |
|---------|-------|--------------|
| While hiding (before killer arrives) | "Me estoy preocupando" | (no reply) |
| While hiding (killer in apartment) | "Contestame por favor" | (no reply) |
| While hiding (killer walking around) | PHONE VIBRATES - "LLAMANDO..." | Fede hangs up |
| After killer enters bathroom | "Fede??" | (no reply) |

The phone vibrating while hiding = maximum tension. Fede must reject the call silently.

### Endings

| Ending | Final Message from Fede |
|--------|-------------------------|
| A (Escape) | "Ahora te llamo" |
| B (Revenge) | "Te cuento despues" |
| C/D (Caught) | Billy: "Fede contestame" / "Fede" / "..." (messages during black screen, then stop) |

---

## Atmospheric Details ("Show Don't Tell")

| What Player Sees | Implication |
|------------------|-------------|
| Multiple wallets on counter | Multiple victims |
| Clothes in many sizes | Multiple victims |
| Duct tape, zip ties in drawer | ... |
| Polaroids on wall | Trophies |
| Empty key hook by door | Killer has the keys |
| Bloody keys on table | Just came from "work" |
| Stains everywhere | ... |
| Killer says nothing | Scarier than dialogue |
| Basement scene | Implies everything, shows nothing |

---

## Item Dependency Chain

```
Plant -> Small Key -> Cabinet -> Flashlight -> Mirror -> Code 1987 -> Toolbox ->
Document + Screwdriver -> Fridge Panel -> Neighbor's Apartment ->
Hide Under Bed -> Wait for Audio Cues -> Killer Arrives -> Bloody Keys ->
Escape/Fight/Caught
```

---

## Killer Behavior

| Phase | Speed | Expression |
|-------|-------|------------|
| Enters apartment | Normal | Casual, humming |
| Spots player (D) | Pause | Smile widens |
| Exits bathroom | Slow | Surprised, then smile |
| Takes out knife | Slow | Enjoying it |
| Approaches | VERY slow | Savoring |
| After being hit | -- | Unconscious |

---

## Audio Cues (Hiding Phase)

| Sound | Meaning | Exit now? |
|-------|---------|-----------|
| Key in lock | Killer arriving | NO |
| Door creak | Killer entering | NO |
| Footsteps | Killer walking | NO |
| Humming | Killer casual | NO |
| Metal clunk | Keys on table | NO (he's still there) |
| Footsteps | Killer moving | NO |
| Door close | Bathroom | YES - NOW |
| Water | Shower | YES - SAFE |

Player learns: **wait for the second door sound (bathroom)**.

---

## Open Questions / TBD

1. Neighbor's apartment layout - 1 floor or 2? Where is bedroom?
2. Hiding mechanic - button to hide or just interact with bed?
3. Exact timing for "too slow" at door before Ending C?
4. Which furniture pieces are pushable in neighbor's apartment?
5. Basement scene duration before fade?
6. Optional: Can player escape back through fridge? (Alternative escape route?)
