# Bot or Not - Tech Stack Vision

## **The Big Picture**

A **Supabase-centric architecture** that handles 90% of your backend needs, keeping development simple and costs low during MVP phase.

---

## **Core Stack (Simple & Unified)**

### **Frontend: React Native**
- Single codebase for iOS and Android
- Fast iteration and hot reload
- Large talent pool for hiring
- Native feel with cross-platform efficiency

### **Backend: Supabase (All-in-One)**
- **Database:** PostgreSQL for all game data, users, messages, scores
- **Authentication:** Built-in guest mode and email signup
- **Real-time:** Live chat, matchmaking updates, vote syncing without Socket.io
- **Edge Functions:** Serverless logic for AI bot triggers, game flow, matchmaking
- **Storage:** Profile pictures and share screenshots (future)

### **AI Layer: OpenAI API**
- GPT-4o-mini generates bot personalities and responses
- Called from Supabase Edge Functions
- Cost-effective at ~$0.60 per 1,000 games

### **Monetization: Native SDKs**
- AdMob for interstitial ads
- In-app purchase libraries for "Remove Ads"

### **Analytics: Mixpanel**
- Track player behavior, retention, funnels
- Informs product decisions

---

## **How It All Connects**

```
Player opens app (React Native)
         ↓
Authenticates through Supabase (guest or email)
         ↓
Joins matchmaking queue (writes to Supabase DB)
         ↓
Edge Function monitors queue, creates game when 4+ players ready
         ↓
Players subscribe to real-time chat channel (Supabase Realtime)
         ↓
When bot needs to respond → Edge Function calls OpenAI → posts to DB
         ↓
All players see message instantly via real-time subscription
         ↓
Voting phase → writes to DB → Edge Function calculates results
         ↓
Results displayed → XP/levels updated → back to matchmaking
```

---

## **Key Architecture Decisions**

### **Why Supabase for Everything?**
- **Simplicity:** One platform, one dashboard, one bill
- **Speed:** Pre-built auth, real-time, and database means less code
- **Cost:** Free tier covers entire MVP phase (up to 50K users)
- **Real-time native:** No need to manage Socket.io servers
- **Auto-scaling:** Handles traffic without manual intervention

### **Why React Native?**
- **One codebase** for both platforms saves 40% development time
- **Mature ecosystem** for gaming, chat, ads
- **Easy hiring** compared to native iOS/Android developers

### **Why OpenAI API?**
- **Proven quality** for conversational AI
- **Cost-effective** at scale (fractions of a cent per game)
- **Flexible:** Easy to adjust bot personalities with prompts
- **Fast responses** (1-2 seconds)

---

## **Data Flow Philosophy**

### **Player-Driven Events**
- Players trigger actions (send message, vote, join queue)
- Data writes to Supabase
- Other players automatically notified via real-time subscriptions

### **Bot-Driven Events**
- Edge Functions monitor game state
- When bot should respond → calls OpenAI → inserts message
- Same real-time flow as human players

### **No Heavy Server Logic**
- Most game rules enforced at database level (constraints, triggers)
- Edge Functions only for AI calls and complex calculations
- Frontend handles UI state and simple validation

---

## **What Lives Where**

### **Frontend (React Native)**
- UI/UX and animations
- Local state management (who's typing, countdown timers)
- Direct database queries via Supabase client
- Real-time subscriptions

### **Backend (Supabase)**
- **Database:** All persistent data (users, games, messages, votes, scores)
- **Edge Functions:** 
  - Matchmaking logic (pairing players)
  - Bot response generation (calling OpenAI)
  - Score calculation after voting
  - Achievement unlocks
- **Realtime:** Message delivery, matchmaking updates, presence

### **External Services**
- **OpenAI:** Bot personalities and responses
- **AdMob:** Ad serving
- **Mixpanel:** Usage analytics and funnels

---

## **Scaling Strategy**

### **Phase 1: MVP (0-5K users)**
- Supabase free tier
- Single database instance
- Edge Functions handle all game logic
- ~$20-50/month total cost

### **Phase 2: Growth (5K-50K users)**
- Upgrade to Supabase Pro ($25/month)
- Add Redis for matchmaking optimization (optional)
- CDN for static assets
- ~$100-200/month

### **Phase 3: Scale (50K+ users)**
- Dedicated database instance
- Read replicas for leaderboards
- Separate Edge Functions by region
- Consider microservices if complexity grows
- ~$500-1,000/month

---

## **Why This Stack Wins for MVP**

### **Speed to Market**
- No need to build auth, real-time infrastructure, API layer
- Focus on game logic and UI
- 4-6 weeks to launch vs 8-10 with custom backend

### **Low Cost**
- Free tier covers MVP entirely
- Only pay for OpenAI usage (~$20-50/month)
- No server management overhead

### **Developer Experience**
- Single language (JavaScript/TypeScript) across stack
- One platform to learn (Supabase)
- Auto-generated API documentation
- Built-in database UI for debugging

### **Future-Proof**
- Can add custom backend services later if needed
- Supabase works alongside other tools
- Database can be migrated if necessary (it's just PostgreSQL)

---

## **Trade-offs Accepted**

### **Vendor Lock-in**
- Heavily dependent on Supabase ecosystem
- Migration would require effort
- **Acceptable because:** Supabase is open-source PostgreSQL underneath

### **Limited Complex Logic**
- Edge Functions best for simple operations
- Very complex game modes might need custom backend
- **Acceptable because:** MVP game logic is straightforward

### **Real-time Limitations**
- Supabase Realtime has rate limits on free tier
- Not ideal for 100+ player lobbies
- **Acceptable because:** MVP is 7-player games max

---

## **The Essence**

**React Native** talks to **Supabase** (which is your entire backend), **Supabase Edge Functions** talk to **OpenAI** when bots need to speak, and everything else is just add-ons (ads, analytics).

**One stack. Minimal complexity. Maximum speed.**

---

## **Tech Stack Summary**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile App** | React Native | iOS + Android from single codebase |
| **Database** | PostgreSQL (Supabase) | Users, games, messages, scores |
| **Authentication** | Supabase Auth | Guest play + email signup |
| **Real-time** | Supabase Realtime | Live chat, matchmaking, voting |
| **Backend Logic** | Supabase Edge Functions | Game flow, matchmaking, AI triggers |
| **AI Bots** | OpenAI GPT-4o-mini | Bot personalities and responses |
| **Ads** | AdMob | Interstitial ads between games |
| **IAP** | React Native IAP | "Remove Ads" purchase |
| **Analytics** | Mixpanel | Player behavior and retention |
| **Hosting** | Supabase | All-in-one platform |

---

## **Cost Breakdown (Monthly)**

### **MVP Phase (0-1K users)**
- Supabase: $0 (free tier)
- OpenAI API: $20-50
- AdMob: $0 (revenue)
- Mixpanel: $0 (free tier)
- **Total: $20-50/month**

### **Growth Phase (5K users)**
- Supabase Pro: $25
- OpenAI API: $100-200
- Mixpanel: $0 (free tier sufficient)
- **Total: $125-225/month**

### **Scale Phase (50K users)**
- Supabase: $200-300
- OpenAI API: $500-800
- Mixpanel Pro: $50
- CDN/Extras: $50-100
- **Total: $800-1,250/month**

---

## **Development Timeline**

### **Week 1-2: Foundation**
- Supabase setup (database schema, auth)
- React Native project initialization
- Basic UI screens (home, chat, results)

### **Week 3-4: Core Gameplay**
- Real-time chat implementation
- Matchmaking logic (Edge Functions)
- Voting system

### **Week 5-6: AI & Polish**
- OpenAI integration for bot responses
- Bot personality system
- Scoring and progression system
- UI polish and animations

### **Week 7-8: Launch Prep**
- AdMob integration
- Analytics setup
- Bug fixes and testing
- App store submissions

**Total: 6-8 weeks to MVP**

---

## **Next Steps**

1. **Set up Supabase project** - Create account, initialize database
2. **Design database schema** - Tables for users, games, messages, votes
3. **Initialize React Native project** - Set up navigation and basic screens
4. **Prototype matchmaking** - Simple queue system with Edge Functions
5. **Build chat interface** - Real-time messaging with Supabase
6. **Integrate OpenAI** - Bot response generation
7. **Add progression system** - XP, levels, achievements
8. **Monetization** - Ads and IAP
9. **Testing & polish** - Bug fixes, performance optimization
10. **Launch** - App stores and marketing

---

## **Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [AdMob Integration Guide](https://developers.google.com/admob)
- [Mixpanel for Gaming](https://mixpanel.com/topics/gaming-analytics/)
