# Poker-For-One Monorepo

This is a monorepo containing multiple poker game implementations and related projects.

## Structure

```
Poker-For-One/
├── main game/          # Main Poker for One game (React + Vite)
└── [future projects]   # Additional games/features will be added here
```

## Projects

### Main Game

The primary single-player poker game where you play against AI in a best-of-3 match.

**Location:** `main game/`

**Setup:**
```bash
cd "main game"
npm install
npm run dev
```

**Features:**
- Single-player poker against AI
- 7 cards dealt to each player
- Discard up to 2 cards per round
- Best-of-3 rounds
- Beautiful responsive UI with Tailwind CSS

## Adding New Projects

To add a new project to this monorepo:

1. Create a new folder in the root directory
2. Set up your project with its own `package.json` and dependencies
3. Update this README with the new project details

## Development

Each project in this monorepo is independent and can be run separately. Navigate to the project folder and follow its specific setup instructions.
