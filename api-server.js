const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// In-memory storage
const characters = new Map();
const raids = new Map();

// Constants
const CLASS_STATS = {
  warrior: { str: 14, dex: 8, int: 4, vit: 12 },
  mage: { str: 4, dex: 10, int: 16, vit: 6 },
  rogue: { str: 10, dex: 14, int: 6, vit: 8 },
  paladin: { str: 10, dex: 8, int: 10, vit: 10 },
  ranger: { str: 10, dex: 14, int: 6, vit: 8 },
  bard: { str: 6, dex: 12, int: 10, vit: 10 }
};

const DUNGEON_CONFIG = {
  easy: { minLvl: 1, maxLvl: 15, xpMin: 200, xpMax: 400, voidMin: 5, voidMax: 15 },
  normal: { minLvl: 15, maxLvl: 30, xpMin: 500, xpMax: 900, voidMin: 15, voidMax: 40 },
  hard: { minLvl: 30, maxLvl: 60, xpMin: 1000, xpMax: 2000, voidMin: 50, voidMax: 120 }
};

// Helpers
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getRaidsToday(wallet) {
  const today = new Date().toISOString().slice(0, 10);
  return (raids.get(wallet) || []).filter(r => r.date === today).length;
}

// ==================== CHARACTER ENDPOINTS ====================

app.post('/character/create', (req, res) => {
  const { wallet, name, class: cls } = req.body;
  
  if (characters.has(wallet)) {
    return res.json({ error: 'Character already exists', character: characters.get(wallet) });
  }
  
  const baseStats = CLASS_STATS[cls] || CLASS_STATS.warrior;
  const character = {
    wallet,
    name,
    class: cls,
    level: 1,
    xp: 0,
    stats: { ...baseStats },
    equipment: { weapon: 'iron_sword', helmet: 'steel_helmet', chest: 'leather_armor', offhand: 'wooden_shield' },
    createdAt: new Date().toISOString()
  };
  
  characters.set(wallet, character);
  res.json({ character, status: 'created' });
});

app.get('/character/stats/:wallet', (req, res) => {
  const char = characters.get(req.params.wallet);
  if (!char) return res.json({ error: 'Character not found' });
  
  const stats = { ...char.stats };
  stats.attack = (stats.str || 10) * 2 + char.level;
  stats.defense = Math.floor((stats.vit || 10) * 1.5) + char.level;
  stats.crit = Math.min(50, Math.floor((stats.dex || 10) * 0.5));
  stats.critDmg = 150 + (stats.dex || 10);
  
  res.json({
    name: char.name,
    class: char.class,
    level: char.level,
    xp: char.xp,
    stats,
    equipment: char.equipment,
    stamina: 3 - getRaidsToday(req.params.wallet)
  });
});

app.post('/character/delete', (req, res) => {
  const { wallet } = req.body;
  if (!characters.has(wallet)) return res.json({ error: 'Character not found' });
  characters.delete(wallet);
  raids.delete(wallet);
  res.json({ status: 'deleted' });
});

// ==================== RAID ENDPOINTS ====================

app.post('/raid/start', (req, res) => {
  const { wallet, difficulty } = req.body;
  const char = characters.get(wallet);
  
  if (!char) return res.json({ error: 'Character not found' });
  if (!DUNGEON_CONFIG[difficulty]) return res.json({ error: 'Invalid difficulty' });
  
  const cfg = DUNGEON_CONFIG[difficulty];
  const raidsToday = getRaidsToday(wallet);
  
  if (raidsToday >= 3) {
    return res.json({ error: 'No stamina remaining' });
  }
  
  // Combat simulation
  const heroAtk = (char.stats.str || 10) + rand(0, 5);
  const bossAtk = 8 + (difficulty === 'easy' ? 2 : difficulty === 'normal' ? 4 : 6);
  const heroHp = (char.stats.vit || 10) * 10;
  const bossHp = difficulty === 'easy' ? 100 : difficulty === 'normal' ? 200 : 400;
  
  let hHp = heroHp, bHp = bossHp;
  let rounds = 0;
  
  while (hHp > 0 && bHp > 0 && rounds < 20) {
    bHp -= heroAtk + rand(0, Math.floor(heroAtk * 0.5));
    if (bHp <= 0) break;
    hHp -= bossAtk + rand(0, Math.floor(bossAtk * 0.3));
    rounds++;
  }
  
  const won = hHp > 0;
  const xpGained = won ? rand(cfg.xpMin, cfg.xpMax) : 0;
  const voidGained = won ? rand(cfg.voidMin, cfg.voidMax) : 0;
  
  // Apply XP
  if (won) {
    char.xp += xpGained;
    while (char.xp >= 1000 * char.level) {
      char.xp -= 1000 * char.level;
      char.level++;
      char.stats.str += 2;
      char.stats.dex += 2;
      char.stats.int += 2;
      char.stats.vit = Math.floor((char.stats.vit || 0) + 1.5);
    }
  }
  
  // Record raid
  if (!raids.has(wallet)) raids.set(wallet, []);
  raids.get(wallet).push({
    date: new Date().toISOString().slice(0, 10),
    difficulty,
    won,
    xp: xpGained,
    void: voidGained,
    timestamp: Date.now()
  });
  
  res.json({
    won,
    xp: xpGained,
    void: voidGained,
    loot: won ? Array(rand(1, 3)).fill(0).map(() => ({ icon: '⚔️', rarity: ['common','uncommon','rare'][rand(0,2)] })) : [],
    boss_defeated: won ? 'Boss slain!' : 'Defeated...',
    newLevel: char.level,
    character: char
  });
});

app.get('/raid/history/:wallet', (req, res) => {
  const raidList = raids.get(req.params.wallet) || [];
  res.json({ raids: raidList.slice(0, 20) });
});

// ==================== UTILITY ENDPOINTS ====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', characters: characters.size, raids: raids.size });
});

app.get('/leaderboard', (req, res) => {
  const sorted = Array.from(characters.values())
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, 10)
    .map((c, i) => ({ rank: i + 1, name: c.name, level: c.level, xp: c.xp, class: c.class }));
  
  res.json({ top_agents: sorted });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🎮 ClawKingdom API running on http://localhost:${PORT}`);
  console.log(`📖 Read SKILL.md for agent integration`);
});
