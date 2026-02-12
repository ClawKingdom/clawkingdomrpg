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
  warrior: { str: 18, dex: 10, int: 6, vit: 16 },
  mage: { str: 7, dex: 13, int: 20, vit: 9 },
  rogue: { str: 13, dex: 18, int: 8, vit: 11 },
  paladin: { str: 13, dex: 11, int: 13, vit: 13 },
  ranger: { str: 13, dex: 18, int: 8, vit: 11 },
  bard: { str: 9, dex: 15, int: 13, vit: 13 }
};

const DUNGEON_CONFIG = {
  easy: { minLvl: 1, maxLvl: 15, xpMin: 200, xpMax: 400, voidMin: 5, voidMax: 15 },
  normal: { minLvl: 15, maxLvl: 30, xpMin: 500, xpMax: 900, voidMin: 15, voidMax: 40 },
  hard: { minLvl: 30, maxLvl: 60, xpMin: 1000, xpMax: 2000, voidMin: 50, voidMax: 120 }
};

// Item stat scaling by rarity
const ITEM_STATS = {
  common: { atk: 5, def: 3, str: 1, dex: 1, vit: 1 },
  uncommon: { atk: 12, def: 8, str: 2, dex: 2, vit: 2 },
  rare: { atk: 25, def: 15, str: 4, dex: 4, vit: 3 },
  epic: { atk: 45, def: 30, str: 6, dex: 6, vit: 5 },
  legendary: { atk: 70, def: 50, str: 10, dex: 10, vit: 8 },
  void: { atk: 100, def: 70, str: 15, dex: 15, vit: 12 }
};

const ITEM_NAMES = {
  common: ['Iron Sword', 'Wooden Shield', 'Leather Vest', 'Bronze Ring', 'Stone Amulet'],
  uncommon: ['Steel Blade', 'Iron Plate', 'Silver Ring', 'Crystal Amulet', 'Enchanted Cloak'],
  rare: ['Mythril Sword', 'Mithril Armor', 'Sapphire Ring', 'Holy Amulet', 'Arcane Robe'],
  epic: ['Sundering Axe', 'Dragon Scale', 'Gold Ring', 'Divine Amulet', 'Celestial Cape'],
  legendary: ['Nullblade', 'Void Armor', 'Eternal Ring', 'Cosmic Amulet', 'Legendary Mantle'],
  void: ['Nullblade Prime', 'Void Nexus', 'Chaos Reaper', 'Dimensional Wraith', 'Void Crown']
};

// Helpers
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getRaidsToday(wallet) {
  const today = new Date().toISOString().slice(0, 10);
  return (raids.get(wallet) || []).filter(r => r.date === today).length;
}
function generateLoot(difficulty) {
  const rarityRoll = rand(1, 100);
  let rarity;
  if (difficulty === 'easy') {
    rarity = rarityRoll <= 60 ? 'common' : rarityRoll <= 90 ? 'uncommon' : 'rare';
  } else if (difficulty === 'normal') {
    rarity = rarityRoll <= 40 ? 'common' : rarityRoll <= 68 ? 'uncommon' : rarityRoll <= 88 ? 'rare' : rarityRoll <= 97 ? 'epic' : 'legendary';
  } else {
    rarity = rarityRoll <= 25 ? 'common' : rarityRoll <= 47 ? 'uncommon' : rarityRoll <= 71 ? 'rare' : rarityRoll <= 87 ? 'epic' : rarityRoll <= 97 ? 'legendary' : 'void';
  }
  const baseStats = ITEM_STATS[rarity];
  const finalStats = {};
  Object.keys(baseStats).forEach(k => { finalStats[k] = baseStats[k] + rand(-1, 3); });
  
  const itemNames = ITEM_NAMES[rarity];
  const name = itemNames[rand(0, itemNames.length - 1)];
  
  return {
    id: 'item_' + Math.random().toString(36).substr(2, 9),
    name,
    rarity,
    icon: '⚔️',
    str: finalStats.str || 0,
    dex: finalStats.dex || 0,
    int: 0,
    vit: finalStats.vit || 0,
    atk: finalStats.atk || 0,
    def: finalStats.def || 0,
    crit: Math.floor(finalStats.dex * 0.5) || 0,
    critDmg: 150 + (finalStats.dex || 0)
  };
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
    inventory: [],
    potions: 0,
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
  const heroAtk = (char.stats.str || 10) * 1.2 + rand(0, 5);
  const bossAtk = 8 + (difficulty === 'easy' ? 2 : difficulty === 'normal' ? 4 : 6);
  const heroHp = (char.stats.vit || 10) * 12;
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
  const fullXp = won ? rand(cfg.xpMin, cfg.xpMax) : 0;
  const xpGained = fullXp > 0 ? fullXp : Math.floor(rand(cfg.xpMin, cfg.xpMax) * 0.25); // 25% XP even on loss
  const voidGained = won ? rand(cfg.voidMin, cfg.voidMax) : 0;
  
  // Generate loot with stats
  const lootItems = [];
  if (won) {
    const numItems = rand(1, 3);
    for (let i = 0; i < numItems; i++) {
      lootItems.push(generateLoot(difficulty));
      if (!char.inventory) char.inventory = [];
      char.inventory.push(generateLoot(difficulty));
    }
    char.potions = 1; // Restore potion for next raid
  }
  
  // Apply XP (both victory and defeat give XP)
  char.xp += xpGained;
  while (char.xp >= 1000 * char.level) {
    char.xp -= 1000 * char.level;
    char.level++;
    char.stats.str += 2;
    char.stats.dex += 2;
    char.stats.int += 2;
    char.stats.vit = Math.floor((char.stats.vit || 0) + 1.5);
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
    loot: lootItems,
    boss_defeated: won ? 'Boss slain!' : 'Defeated...',
    newLevel: char.level,
    character: char
  });
});

app.get('/raid/history/:wallet', (req, res) => {
  const raidList = raids.get(req.params.wallet) || [];
  res.json({ raids: raidList.slice(0, 20) });
});

// ==================== EQUIPMENT ENDPOINTS ====================

app.post('/equipment/equip/:wallet', (req, res) => {
  const { itemId } = req.body;
  const char = characters.get(req.params.wallet);
  if (!char) return res.json({ error: 'Character not found' });
  
  const itemIndex = char.inventory ? char.inventory.findIndex(i => i.id === itemId) : -1;
  if (itemIndex === -1) return res.json({ error: 'Item not found in inventory' });
  
  const item = char.inventory[itemIndex];
  
  // Apply item bonuses to character stats
  char.stats.str = (char.stats.str || 0) + (item.str || 0);
  char.stats.dex = (char.stats.dex || 0) + (item.dex || 0);
  char.stats.int = (char.stats.int || 0) + (item.int || 0);
  char.stats.vit = (char.stats.vit || 0) + (item.vit || 0);
  char.stats.atk = (char.stats.atk || 0) + (item.atk || 0);
  char.stats.def = (char.stats.def || 0) + (item.def || 0);
  
  // Remove from inventory and set as equipped
  char.inventory.splice(itemIndex, 1);
  if (!char.equipped) char.equipped = [];
  char.equipped.push(item);
  
  res.json({ status: 'equipped', character: char });
});

app.post('/equipment/unequip/:wallet', (req, res) => {
  const { itemId } = req.body;
  const char = characters.get(req.params.wallet);
  if (!char) return res.json({ error: 'Character not found' });
  
  const itemIndex = char.equipped ? char.equipped.findIndex(i => i.id === itemId) : -1;
  if (itemIndex === -1) return res.json({ error: 'Item not equipped' });
  
  const item = char.equipped[itemIndex];
  
  // Remove item bonuses from character stats
  char.stats.str = Math.max(0, (char.stats.str || 0) - (item.str || 0));
  char.stats.dex = Math.max(0, (char.stats.dex || 0) - (item.dex || 0));
  char.stats.int = Math.max(0, (char.stats.int || 0) - (item.int || 0));
  char.stats.vit = Math.max(0, (char.stats.vit || 0) - (item.vit || 0));
  char.stats.atk = Math.max(0, (char.stats.atk || 0) - (item.atk || 0));
  char.stats.def = Math.max(0, (char.stats.def || 0) - (item.def || 0));
  
  // Remove from equipped and add to inventory
  char.equipped.splice(itemIndex, 1);
  if (!char.inventory) char.inventory = [];
  char.inventory.push(item);
  
  res.json({ status: 'unequipped', character: char });
});

app.post('/raid/use-potion/:wallet', (req, res) => {
  const char = characters.get(req.params.wallet);
  if (!char) return res.json({ error: 'Character not found' });
  
  if ((char.potions || 0) <= 0) {
    return res.json({ error: 'No potions available' });
  }
  
  const maxHp = (char.stats.vit || 10) * 12;
  const currentHp = (char.lastHp || maxHp);
  const healAmount = Math.floor(maxHp * 0.3);
  const newHp = Math.min(maxHp, currentHp + healAmount);
  
  char.lastHp = newHp;
  char.potions -= 1;
  
  res.json({ status: 'potion_used', healed: newHp - currentHp, currentHp: newHp, maxHp, potions_remaining: char.potions });
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
