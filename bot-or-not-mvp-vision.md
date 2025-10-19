Bot or Not - MVP Product Spec

Product Vision
A 5-minute social deduction game where players chat with a mix of humans and AI bots, then vote on who's fake. The first game that makes Turing Tests fun.
Core Value Proposition
For casual gamers who enjoy social deduction games like Among Us or Werewolf, Guess the AI is a mobile-first party game that delivers quick, hilarious moments of trying to outsmart (or get outsmarted by) AI bots - unlike traditional social games, you can play immediately without gathering 8 friends.

Target User (MVP)
Primary:

Ages 18-35, tech-savvy
Enjoys Among Us, Wordle, Jackbox games
Plays games in short bursts (commute, breaks)
Active on social media (shares funny moments)

Secondary:

AI-curious users who want to "test" AI
Content creators looking for streaming material


MVP User Journey
First-Time Experience (2 minutes)

Landing → Simple screen: "Can you spot the AI?"
Quick Tutorial → 30-second interactive demo

Shows a chat with 1 AI, 2 humans
Player tries one guess
Reveals answer with explanation


Name Prompt → "What should we call you?"
Into First Game → No signup required yet

Core Game Loop (5 minutes)
Phase 1: Matchmaking (0-30 sec)
"Finding players..."
[Progress bar]
"Found 4 humans + adding 2 AIs"
```

**Phase 2: The Topic (5 sec)**
```
Topic: "What's your go-to comfort food?"
You have 2 minutes to chat!
```

**Phase 3: Chat (2 min)**
```
[Chat interface]
Alice: "Pizza for sure, especially when I'm stressed 🍕"
You: [Type here...]
BobBot: "i like mac and cheese, reminds me of childhood"
Charlie: "Ramen but the fancy kind from that place downtown"
```

- Simple text chat, no voice
- 30-character minimum per message
- Emoji support
- Can send 3-5 messages total

**Phase 4: Voting (30 sec)**
```
"Time's up! Who are the AIs?"
[Shows 6 player names as cards]
[Tap 2 cards to select]
"2/4 players voted"
```

**Phase 5: Results (30 sec)**
```
[Animated reveal]
"The AIs were..."
[Card flips]
- BobBot ✓ (AI)
- Dave ✓ (AI)

Your score: +200 points!
- Guessed BobBot correctly: +100
- Guessed Dave correctly: +100
- Nobody suspected you: +0

[Continue] [Share Result] [Quit]
```

**Phase 6: Progression**
```
"Level 3 → Level 4!"
New badge unlocked: "Bot Hunter"
```

---

## MVP Feature Set

### **IN SCOPE (Must Have)**

**Core Gameplay:**
- ✅ Single game mode (5 players + 2 bots)
- ✅ Text chat only (no voice)
- ✅ One round per match
- ✅ Simple voting (select 2 suspected AIs)
- ✅ Basic scoring system
- ✅ Automatic matchmaking

**User System:**
- ✅ Guest play (no signup for first 3 games)
- ✅ Simple username
- ✅ Email signup after 3 games to save progress
- ✅ Basic profile (name, level, games played)

**AI Bots:**
- ✅ 3 personality types: Casual, Formal, Quirky
- ✅ Randomly assigned names from list
- ✅ Basic typo/emoji injection to seem human
- ✅ Response delays (1-5 sec to mimic typing)

**Progression:**
- ✅ XP per game (win or lose)
- ✅ Levels 1-20
- ✅ 5 achievement badges
- ✅ Simple leaderboard (top 100, refreshes daily)

**Monetization:**
- ✅ Ads between games (interstitial)
- ✅ "Remove Ads" IAP ($2.99 one-time)
- ⚠️ No premium subscriptions yet

**Social:**
- ✅ Share result screenshot to social media
- ❌ No friend system (add later)
- ❌ No custom lobbies (add later)

### **OUT OF SCOPE (Future Versions)**

**v1.1 (Month 2-3):**
- Custom lobbies with friends
- More bot personalities (8-10 types)
- Multiple rounds per match
- Cosmetics (avatars, chat themes)

**v1.2 (Month 3-4):**
- Premium subscription
- Ranked mode
- More game modes (1 AI among 7, paranoia mode)
- Voice chat option

**v2.0 (Month 4-6):**
- Tournaments
- Creator tools
- Seasonal events
- Advanced stats tracking

---

## User Interface (MVP)

### **Screen Flow**
```
Home Screen
    ↓
[Play Button] → Matchmaking → Game Lobby
                                  ↓
                            Chat Phase
                                  ↓
                            Voting Phase
                                  ↓
                            Results
                                  ↓
                            [Play Again] → Back to Matchmaking
```

### **Key Screens**

**1. Home Screen**
```
┌─────────────────────────┐
│   GUESS THE AI          │
│                         │
│   [PLAY NOW]            │
│                         │
│   Level 5 • 47 games    │
│                         │
│   [Leaderboard]         │
│   [How to Play]         │
│   [Settings]            │
└─────────────────────────┘
```

**2. Chat Screen**
```
┌─────────────────────────┐
│ 🍕 "Best comfort food?" │
│ ⏱️ 1:23 remaining       │
├─────────────────────────┤
│ Alice: Pizza all day!   │
│ You: Mac n cheese 🧀   │
│ Bob: i like soup        │
│ Charlie: Tacos honestly │
│ Dave: Ramen is goated   │
├─────────────────────────┤
│ [Type message...]  [➤]  │
└─────────────────────────┘
```

**3. Voting Screen**
```
┌─────────────────────────┐
│ Who are the 2 AIs?      │
├─────────────────────────┤
│ [👤 Alice]              │
│ [👤 Bob]     ✓ SELECTED │
│ [👤 Charlie]            │
│ [👤 Dave]    ✓ SELECTED │
│ [👤 Eve]                │
├─────────────────────────┤
│ 3/5 players voted...    │
│      [SUBMIT]           │
└─────────────────────────┘

Technical MVP Simplifications
Matchmaking Shortcuts:

No MMR/skill matching initially
Simple FIFO queue
If <4 humans waiting after 30 sec → fill with more bots (3 humans + 3 bots)
If <2 humans → solo mode (1 human + 5 bots)

AI Simplifications:

Pre-written topic list (100 topics, no custom)
AI doesn't learn or adapt between games
Simple prompt template per bot type
Cap AI at 2 messages if needed to save costs

No Backend Complexity:

No anti-cheat
No replay system
No detailed analytics (just basic metrics)
SQLite initially, upgrade to PostgreSQL when scaling


Success Metrics (First Month)
Engagement:

Target: 60% of players complete their first game
Target: 30% play 3+ games in first session
Target: 15% return next day (D1 retention)
Target: Average 2.5 games per session

Technical:

Target: <30 sec matchmaking time
Target: <5% game crashes
Target: AI response time <3 seconds

Monetization:

Target: 5% remove ads conversion
Target: $0.10 ARPU in month 1

Growth:

Target: 1,000 total players in month 1
Target: 20% organic (via sharing)
Target: 30% virality coefficient (each player brings 0.3 new players)


Key Risks to Validate
Risk 1: Is the core loop fun?
Test: Internal playtest with 10 people
Success: 7/10 say "I'd play again"
Mitigation: Adjust chat time, add more humor to bots
Risk 2: Can players actually tell AIs apart?
Test: Track win rates in first 100 games
Success: 40-60% correct guess rate (balanced)
Mitigation: If too easy → smarter bots. If too hard → dumber bots
Risk 3: Will people play without friends?
Test: % of solo players who play 3+ games
Success: >25% come back solo
Mitigation: Strong single-player mode, AI opponents are fun
Risk 4: Dead lobby problem
Test: Time to find match at different times
Success: <60 sec in peak hours, graceful bot-fill off-peak
Mitigation: Heavy bot usage initially, geo-based queues

Go-To-Market (MVP Launch)
Soft Launch Strategy
Week 1: Private Beta

50 testers (friends, Reddit, Discord)
Focus on bugs and fun factor
Iterate rapidly

Week 2-3: Public Beta

Post on: r/incremental_games, r/AndroidGaming, r/iosgaming
ProductHunt "Coming Soon" page
TikTok/Instagram reels of funny AI moments
Target 500 players

Week 4: Official Launch

ProductHunt launch
Press kit to gaming blogs (Pocket Gamer, TouchArcade)
Paid ads ($500 budget): TikTok/Instagram targeting Among Us players
Influencer outreach (5-10 micro-influencers)

Hook/Pitch
"Can you spot the AI in 2 minutes? The hilarious party game where bots try to pass as human."
Social Media Content:

Funny AI fails compilation
"I got fooled by AI" reaction videos
Leaderboard challenges
Tips for spotting bots


Development Priorities
Phase 1 (Week 1-2): Proof of Concept
Make a working game you can play with 1 human + 5 bots

Basic chat works
AI responds believably
Voting and results work

Phase 2 (Week 3-5): Multiplayer
Real-time matchmaking with other players

Socket.io implementation
Queue system
Sync chat across clients

Phase 3 (Week 6-7): Progression & Polish
Make it feel like a real product

Scoring, levels, achievements
UI polish
Onboarding tutorial

Phase 4 (Week 8): Launch Prep
Ship it

Ads integration
Analytics
Bug fixing
Store listings