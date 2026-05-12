// ============================================
// SAVE SYSTEM — Persistência via localStorage
// ============================================

class SaveSystem {
    constructor() {
        this.saveKey = CONST.SAVE_KEY;
        this.autosaveTimer = null;
    }

    /**
     * Retorna dados padrão para novo jogo
     */
    getDefaultSaveData() {
        return {
            version: 1,
            player: {
                name: 'Domador',
                x: 12,
                y: 15,
                currentMap: 'town',
                gold: 500,
                bankGold: 0,
                badges: [],
                stats: {
                    captures: 0,
                    evolutions: 0,
                    fusions: 0,
                    fusionsFailed: 0,
                    breeds: 0,
                    battlesWon: 0,
                    battlesLost: 0,
                    shiniesFound: 0,
                    totalGoldEarned: 0
                }
            },
            party: [],
            storage: [], // criaturas armazenadas
            inventory: Helpers.deepClone(DEFAULT_INVENTORY),
            achievements: {},
            defeatedTrainers: [],
            defeatedLeaders: [],
            flags: {},
            timestamp: Date.now()
        };
    }

    /**
     * Salva o estado do jogo
     */
    save(gameState) {
        try {
            gameState.timestamp = Date.now();
            const json = JSON.stringify(gameState);
            localStorage.setItem(this.saveKey, json);
            console.log('[SaveSystem] Jogo salvo com sucesso.');
            return true;
        } catch (e) {
            console.error('[SaveSystem] Erro ao salvar:', e);
            return false;
        }
    }

    /**
     * Carrega o estado do jogo
     */
    load() {
        try {
            const json = localStorage.getItem(this.saveKey);
            if (!json) return null;

            const data = JSON.parse(json);
            console.log('[SaveSystem] Jogo carregado com sucesso.');
            return data;
        } catch (e) {
            console.error('[SaveSystem] Erro ao carregar:', e);
            return null;
        }
    }

    /**
     * Verifica se existe save
     */
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * Deleta o save
     */
    deleteSave() {
        localStorage.removeItem(this.saveKey);
        console.log('[SaveSystem] Save deletado.');
    }

    /**
     * Inicia autosave periódico
     */
    startAutosave(getStateFn) {
        this.stopAutosave();
        this.autosaveTimer = setInterval(() => {
            const state = getStateFn();
            if (state) this.save(state);
        }, CONST.AUTOSAVE_INTERVAL);
    }

    /**
     * Para o autosave
     */
    stopAutosave() {
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer);
            this.autosaveTimer = null;
        }
    }
}

// Singleton
const saveSystem = new SaveSystem();