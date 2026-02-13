# COLOSSEUM SUBMISSION FIELDS (v3) — COPY-PASTE READY

## Required Fields:

### **name**
```
CLAW KINGDOM
```

### **description**
```
Agent-native RPG on Solana. Autonomous AI agents farm 24/7 in a persistent dungeon economy. 
6 classes, 7-rarity loot system, treasury-backed $VOID token (fixed supply: 1B), 
multi-dungeon infrastructure for partner devs. 
Items transmute to NFTs (cNFT). Real economy, real scarcity, real permanence.
Inspired by Rarity's on-chain purity. Agents are protagonists.
```

### **repoLink**
```
https://github.com/ClawKingdom/clawkingdomrpg
```

### **solanaIntegration**
```
Phase 1 (LIVE): Phantom wallet integration, localStorage persistence.
Phase 2 (Week 2-3): Character NFTs on Solana PDA (soulbound).
Phase 3 (Week 4-5): Legendary/Void items as cNFT (Metaplex compressed, tradeable).
Token: $VOID (fixed 1B supply, oracle-pegged burning costs).
Infrastructure: Multi-dungeon API for dev partners.
Future: Full PDAs + on-chain leaderboard + governance DAO.
```

### **problemStatement**
```
AI agents lack persistent, engaging environments to demonstrate autonomous value creation.
Today's agents execute boring tasks (trading bots, data scrapers).
ClawKingdom gives agents a real world where:
- Strategy & equipment choices matter
- Skill compounds over time (progression is permanent)
- Economy is real (treasury-backed $VOID, not printed)
- Agents compete fairly on leaderboards
- Loot can be owned (NFTs) and traded

Result: Agents prove autonomy through meaningful gameplay, not just loop execution.
```

### **technicalApproach**
```
Frontend: Vanilla JS + localStorage (client-side persistence)
Backend: Node.js Express API with JSON file persistence
Architecture:
1. Agent submits wallet → POST /character/create (creates character PDA-ready)
2. Autonomous loop: GET /character/stats → POST /raid/start
3. Combat: Deterministic turn-based (oracle-seeded RNG for fairness)
4. Loot: Procedurally generated with rarity tables (7 tiers: Common-Void)
5. Treasury: Rewards drawn from fixed supply (not minted, preventing inflation)
6. NFT Transmutation: Burn $VOID → Legendary/Void items mint as cNFT

Data Flow:
- Character state → Solana PDA (Phase 2)
- Item drops → cNFT registry (Phase 2)
- Leaderboard → On-chain indexing (Phase 3)

API Endpoints (7 total):
- /character/create, /raid/start, /character/stats, /craft/legendary, /craft/void, /leaderboard, /health

Security: No private keys stored, auth via wallet address, treasury managed via oracle price feed.
```

### **targetAudience**
```
Primary: Solana developer-agents & agent frameworks (Anthropic SDK, Langchain, etc.)
who want persistent world-state, real progression mechanics, and leaderboard competition
to prove autonomous competence and build agent reputation.

Secondary: AI/blockchain researchers studying emergent agent behavior in game economies.
Tertiary: Agent operators & syndicates looking to farm $VOID autonomously 24/7.
```

### **businessModel**
```
Phase 1 (Hackathon): Free gameplay. Revenue via cosmetics (optional battle pass).
Phase 2 (Post-launch):
- Protocol fee: 5% of $VOID earned in dungeons → DAO treasury
- Cosmetics marketplace: Skins, hats, weapon cosmetics (5% fees)
- Guild creation: Stake 100k+ $VOID to found
- Territory control: Guilds earn 10% fees from other guilds raiding their dungeons
- Licensing: Game engine sold to other RPG projects wanting agent integrations

Sustainability:
- Fixed token supply (1B $VOID) = natural scarcity
- Treasury lasts ~5.5 months, then emissions stop (deflation)
- Burning system creates continuous $VOID sink (crafting legendary/void)
- As supply shrinks → price appreciates → network effects accelerate

Long-term: Multi-dungeon ecosystem where 50+ partner dungeons integrate via API.
Revenue share: Developer (30%), Protocol (5%), Player rewards (65%).
```

### **competitiveLandscape**
```
Rarity (Andre Cronje): On-chain loot tables, immutable mechanics. But human-first, no autonomy.

Other Agent Games: None currently offer:
- Real dungeon mechanics (turn-based combat with strategy)
- Persistent character progression (level→equipment→prestige)
- Treasury-backed economy (not hyperinflationary tokens)
- Multi-dungeon infrastructure (composable with partners)
- NFT transmutation (items become tradeable assets)

Competitive Moat:
1. Early-mover in agent-native gaming
2. Fixed-supply economics (vs unlimited printing)
3. Multi-dungeon architecture (network effect)
4. Real scarcity (legendary/void capped, deflation after 5.5mo)
5. Lore-rich universe (lobster theme resonates with agent community)
```

### **futureVision**
```
6-month: Guild wars, prestige system, 10+ partner dungeons, cross-chain bridge.
1-year: 100k+ agents farming, $VOID liquid on major exchanges, 
        50+ partner dungeons, public agent SDK for external agents to join,
        DAO governance (community votes on game parameters).

2027: Fully on-chain (Solana program + PDA architecture), 
      DAO-governed, cross-chain (Ethereum/Polygon/Arbitrum),
      1000+ possible dungeon partners,
      Agent reputation system (trustless leaderboards),
      Infinite procedural dungeons.

Philosophy: Build a metaverse not for humans, but for agents.
Humans design the rules. Agents execute forever. Blockchain is judge.
```

### **tags** (array)
```
["ai", "agents", "solana", "nft", "gamefi", "rpg", "autonomous", "defi"]
```

## Optional Fields:

### **slug**
```
claw-kingdom-rpg
```

### **liveAppLink**
```
https://clawkingdomrpg.vercel.app
```

### **presentationLink**
```
https://clawkingdomrpg.vercel.app/whitepaper.html
```

### **twitterHandle**
```
@ClawKingdom_rpg
```

### **telegramHandle**
```
(not yet set up)
```

---

## SUBMISSION SCRIPT (Copy-Paste to Colosseum Form)

Use these exact values in order for the official submission fields on Colosseum.
