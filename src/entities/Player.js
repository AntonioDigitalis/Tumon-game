// ============================================
// PLAYER — Entidade do jogador (lógica pura)
// ============================================

class PlayerData {
    constructor() {
        this.name = 'Domador';
        this.x = 12;
        this.y = 15;
        this.currentMap = 'town';
        this.gold = 500;
        this.bankGold = 0;
        this.party = []; // Array de Creature
        this.storage = []; // Criaturas armazenadas
        this.inventory = Helpers.deepClone(DEFAULT_INVENTORY);
        this.badges = [];
        this.defeatedTrainers = [];
        this.defeatedLeaders = [];
        this.stats = {
            captures: 0,
            evolutions: 0,
            fusions: 0,
            fusionsFailed: 0,
            breeds: 0,
            battlesWon: 0,
            battlesLost: 0,
            shiniesFound: 0,
            totalGoldEarned: 0
        };
        this.flags = {};
    }

    /**
     * Adiciona criatura ao time ou storage
     */
    addCreature(creature) {
        if (this.party.length < CONST.MAX_PARTY_SIZE) {
            this.party.push(creature);
            return 'party';
        }
        this.storage.push(creature);
        return 'storage';
    }

    /**
     * Remove criatura por uid
     */
    removeCreature(uid) {
        let idx = this.party.findIndex(c => c.uid === uid);
        if (idx >= 0) {
            return this.party.splice(idx, 1)[0];
        }
        idx = this.storage.findIndex(c => c.uid === uid);
        if (idx >= 0) {
            return this.storage.splice(idx, 1)[0];
        }
        return null;
    }

    /**
     * Encontra criatura por uid
     */
    findCreature(uid) {
        return this.party.find(c => c.uid === uid) || this.storage.find(c => c.uid === uid);
    }

    /**
     * Adiciona item ao inventário
     */
    addItem(itemId, quantity = 1) {
        this.inventory[itemId] = (this.inventory[itemId] || 0) + quantity;
    }

    /**
     * Remove item do inventário
     */
    useItem(itemId, quantity = 1) {
        if (!this.inventory[itemId] || this.inventory[itemId] < quantity) return false;
        this.inventory[itemId] -= quantity;
        if (this.inventory[itemId] <= 0) delete this.inventory[itemId];
        return true;
    }

    /**
     * Verifica se tem item
     */
    hasItem(itemId, quantity = 1) {
        return (this.inventory[itemId] || 0) >= quantity;
    }

    /**
     * Adiciona ouro
     */
    addGold(amount) {
        this.gold += amount;
        this.stats.totalGoldEarned += amount;
    }

    /**
     * Gasta ouro
     */
    spendGold(amount) {
        if (this.gold < amount) return false;
        this.gold -= amount;
        return true;
    }

    /**
     * Deposita no banco (mãe)
     */
    depositGold(amount) {
        if (this.gold < amount) return false;
        this.gold -= amount;
        this.bankGold += amount;
        return true;
    }

    /**
     * Saca do banco
     */
    withdrawGold(amount) {
        if (this.bankGold < amount) return false;
        this.bankGold -= amount;
        this.gold += amount;
        return true;
    }

    /**
     * Cura todo o time
     */
    healAll() {
        this.party.forEach(c => c.fullHeal());
    }

    /**
     * Retorna primeiro criatura viva do time
     */
    getFirstAlive() {
        return this.party.find(c => c.isAlive());
    }

    /**
     * Verifica se tem criaturas vivas
     */
    hasAliveCreatures() {
        return this.party.some(c => c.isAlive());
    }

    /**
     * Serializa para save
     */
    serialize() {
        return {
            name: this.name,
            x: this.x,
            y: this.y,
            currentMap: this.currentMap,
            gold: this.gold,
            bankGold: this.bankGold,
            party: this.party.map(c => c.serialize()),
            storage: this.storage.map(c => c.serialize()),
            inventory: Helpers.deepClone(this.inventory),
            badges: [...this.badges],
            defeatedTrainers: [...this.defeatedTrainers],
            defeatedLeaders: [...this.defeatedLeaders],
            stats: Helpers.deepClone(this.stats),
            flags: Helpers.deepClone(this.flags)
        };
    }

    /**
     * Desserializa do save
     */
    static deserialize(data) {
        const player = new PlayerData();
        player.name = data.name;
        player.x = data.x;
        player.y = data.y;
        player.currentMap = data.currentMap;
        player.gold = data.gold;
        player.bankGold = data.bankGold || 0;
        player.party = (data.party || []).map(c => Creature.deserialize(c));
        player.storage = (data.storage || []).map(c => Creature.deserialize(c));
        player.inventory = data.inventory || Helpers.deepClone(DEFAULT_INVENTORY);
        player.badges = data.badges || [];
        player.defeatedTrainers = data.defeatedTrainers || [];
        player.defeatedLeaders = data.defeatedLeaders || [];
        player.stats = data.stats || player.stats;
        player.flags = data.flags || {};
        return player;
    }
}