# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-26

### Added

#### Game Modes
- Classic Mode: standard tic-tac-toe against AI or local two-player
- Zen Mode: infinite gameplay with fading moves
- Two AI difficulty levels: Easy (random moves) and Hard (Minimax algorithm)

#### Economy System
- Hearts: in-game currency
- Game rewards: 15 for win, 5 for draw, 2 for loss
- Fortune wheel: daily spin with prizes ranging from 10 to 200 Hearts
- Promo codes: generated on wins, provide +25 Hearts and 50% discount

#### Customization
- 3 themes: Classic, Love, Nature
- 4 wallpapers: Dreamy, Midnight, Sakura, Fresh
- 8 stickers: emoji reactions for in-game communication
- 6 avatars: animated animal characters
- 8 affirmations: collectible positive message cards

#### Gamification
- 5 achievements: First Steps, On Fire, Veteran, Champion, Peacekeeper
- Daily quests: 5 quest types with progress tracking
- Statistics: wins, losses, draws, streaks

#### Telegram Integration
- WebApp API: haptic feedback, platform detection
- Deep links: startapp parameters for navigation
- Bot commands: /stats, /daily, /shop, /promo, /hearts, /about, /support

#### Technical Features
- Web Audio API: synthesized sounds without external files
- LocalStorage: data persistence
- 3D tilt effect: interactive game board
- Animations: confetti, particles, smooth transitions
- Docker: production-ready deployment configuration

### Infrastructure
- Docker and Docker Compose configuration
- Nginx for production builds
- Tuna tunnel integration for public access
- Express.js backend with health checks

---

## [Unreleased]

### Planned
- Online multiplayer
- Leaderboards
- Additional themes and customization options
- Seasonal events
