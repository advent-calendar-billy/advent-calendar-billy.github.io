# Castlevania Game - Feature Requests

## Tasks

### 1. Intro Conversation
- [x] Add intro conversation from index.html to simple.html
- [x] Add character icons for Federico and Dracula
  - [x] Federico: Use desktop screenshot, stylize into pixel art/SVG
  - [x] Dracula: Create pixel art directly

### 2. Character Icons
- [x] Create Federico pixel art icon (from desktop screenshot)
- [x] Create Dracula pixel art icon

### 3. Platformer Section
- [x] Add 2-3 rooms before reaching Dracula
- [x] Add easier zombie enemies in Castlevania SOTN aesthetics
- [x] Make it more of a platformer style
- [x] Conversation with Dracula occurs after these rooms

### 4. Soundtrack
- [x] Download Castlevania Symphony of the Night soundtrack
- [x] Add music to the game

## Progress Log
- Started: Working on understanding existing structure
- Completed: Created pixel art portraits for Fedecard and Dracula
- Completed: Downloaded SOTN soundtrack (Dracula's Castle, The Final Toccata)
- Completed: Created game.html with:
  - 3 platformer rooms with platforms and zombie enemies
  - Intro dialogue system with character portraits
  - Room progression (clear zombies to advance)
  - Boss fight with Dracula at the end
  - Background music for exploration and boss fight

### Update 2 - Enhanced Features
- Added 7 rooms total with branching paths:
  - Castle Entrance (0,0) -> Marble Corridor (1,0) -> Outer Wall (2,0)
  - Marble Corridor has exit DOWN to Underground Passage (1,1)
  - Outer Wall has exit DOWN to Clock Tower (2,1) - **Double Jump here!**
  - Underground Passage goes DOWN to Throne Approach (1,2)
  - Throne Approach goes RIGHT to Throne Room (2,2) - **Boss**
- Made zombies bigger (80x110 instead of 60x80)
- Added 3 music tracks:
  - Dracula's Castle - entrance areas
  - Lost Painting - underground/deeper areas
  - The Final Toccata - boss fight
- Double Jump is now a collectible in Clock Tower (2,1)
- Press M to view the castle map (only shows explored rooms)

### Update 3 - Collectible Weapons & Sub-Weapons System
- **Collectible Swords**:
  - Start with only Alucard Sword
  - Crissaegrim found in Outer Wall (2,0)
  - Holy Sword found in Throne Approach (1,2)
- **Sub-Weapons System** (Classic Castlevania throwable weapons):
  - Dagger - Found in Castle Entrance (0,0) - Fast straight throw
  - Axe - Found in Underground Passage (1,1) - Arcing throw
  - Holy Water - Found in Clock Tower (2,1) - Creates blue flames on ground
  - Cross - Found in Throne Approach (1,2) - Boomerang effect, returns to player
- **Hearts Currency**:
  - Start with 5 hearts
  - Enemies drop hearts on death (70% chance)
  - Small hearts = 1, Big hearts (30% chance) = 5
  - Hearts used as ammo for sub-weapons
- **Controls**:
  - Press S to throw equipped sub-weapon
  - Access equipment menu with ENTER to change sub-weapon
- **Added climb-back platforms** in rooms with UP exits

### Update 4 - Hidden Rooms, New Enemies & Harder Boss
- **2 New Hidden Rooms** accessible via breakable walls:
  - Secret Catacombs (0,1) - Behind breakable wall in Castle Entrance (left)
  - Hidden Armory (3,0) - Behind breakable wall in Outer Wall (right)
- **Breakable Walls System**:
  - Attack cracked walls to destroy them
  - Reveals hidden passages to secret rooms
- **DOWN+Z Ground Break**:
  - Stand on cracked floor sections and press DOWN+Z
  - Floor collapses, dropping you to room below
  - Breakable floor in Marble Corridor (1,0)
- **HP Upgrade Collectibles**:
  - Golden heart with + symbol
  - Found in Secret Catacombs and Hidden Armory
  - Increases max HP by 25 and fully restores health
- **2 New Enemy Types**:
  - Bat - Flying enemy that swoops down to attack (25 HP)
  - Knight - Heavy armored enemy, slow but tanky (150 HP)
- **Billycula (Boss) Enhancements**:
  - HP increased from 500 to 800
  - New "Blood Rain" attack - projectiles fall from above
  - Phase 3 "Enraged" mode at 25% HP
    - Faster attack speed
    - More projectiles
    - Higher damage
    - Visual warning: "BILLYCULA IS ENRAGED!"

## Files Created
- `sprites/portraits/fedecard.svg` - Pixel art portrait of Federico
- `sprites/portraits/dracula.svg` - Pixel art portrait of Dracula
- `audio/draculas_castle.mp3` - Background music for entrance areas
- `audio/lost_painting.mp3` - Background music for underground areas
- `audio/final_toccata.mp3` - Boss fight music
- `game.html` - New enhanced game with all features
