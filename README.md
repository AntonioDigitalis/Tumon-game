# Tumon-game

# 🌟 Tumon — Monster Tamer RPG

Jogo RPG de coleta e batalha de criaturas, desenvolvido com **Phaser 3** e **JavaScript puro**, rodando direto no navegador sem necessidade de instalação.

> Inspirado em jogos como Pokémon e Tibia, com identidade própria e visual pixel art.

---

## 🎮 Como jogar

| Tecla | Ação |
|---|---|
| `W A S D` ou `↑ ↓ ← →` | Mover o personagem |
| `E` | Interagir com NPCs |
| `I` | Abrir inventário / menu |
| `ESC` | Fugir de batalhas selvagens |

- Caminhe pela **grama alta** para encontrar criaturas selvagens
- Fale com NPCs para curar, comprar itens e batalhar
- Derrote os **Líderes Elementais** na Rota 3 para ganhar badges

---

## 🗺️ Mundo

| Mapa | Descrição |
|---|---|
| **Vila Aurora** | Cidade inicial com curandeira, mercador e mãe (banco) |
| **Rota 1 - Trilha Verde** | Primeira área selvagem, Domador Kai |
| **Rota 2 - Costa Azul** | Área aquática, Domadora Luna |
| **Rota 3 - Pico Sombrio** | Área avançada com os dois Líderes Elementais |
| **Caverna das Sombras** | Dungeon opcional com criaturas raras e difíceis |

---

## 🐾 Criaturas

14 criaturas com **9 elementos**: Fogo, Água, Planta, Elétrico, Terra, Gelo, Psíquico, Sombrio e Normal.

Cada criatura tem:
- **Genética** (1–5 estrelas): afeta stats base. Genética 5 = shiny automático ✨
- **Tier** (1–3): aumentado via fusão, melhora stats e chance crítica
- **Traits**: bônus passivos herdados por breeding ou mutação (`swift`, `tough`, `fierce`, `hardy`, `lucky`)
- **Evolução**: algumas criaturas evoluem ao atingir certo nível

---

## ⚔️ Sistemas

### Batalha
- Turnos baseados em velocidade
- Fórmula de dano com STAB (bônus de mesmo elemento), efetividade, crítico e variação aleatória
- Status: queimadura, veneno, congelamento, paralisia
- IA inimiga prioriza ataques super efetivos e cura quando HP baixo

### Captura
- Usa esferas (Comum, Avançada, Rara)
- Chance aumenta com HP baixo, status aplicado e achievements desbloqueados

### Evolução & XP
- XP ganho em batalhas → level up → possível evolução automática
- Chance de mutação a cada level up (bônus de stat ou novo trait)

### Fusão
- Duas criaturas do mesmo tier e genética → 50% de subir de tier
- Falha = perde uma das criaturas ⚠️

### Breeding
- Dois pais nível 5+ geram um filhote com genética herdada
- Filhote nasce na forma base, pode herdar traits dos pais

### Achievements
- 9 conquistas desbloqueáveis que dão bônus permanentes de captura, crítico e loot

---

## 🏗️ Estrutura do Projeto

```
/
├── index.html
├── style.css
└── src/
    ├── config.js           # Configuração do Phaser
    ├── main.js             # Bootstrap
    ├── utils/
    │   ├── constants.js    # CONST — todas as constantes do jogo
    │   └── helpers.js      # Funções utilitárias
    ├── data/
    │   ├── creatures.js    # CreaturesDB + EncounterTables
    │   ├── moves.js        # MovesDB
    │   ├── elements.js     # Tabela de efetividade
    │   ├── items.js        # ItemsDB + ShopInventory
    │   ├── maps.js         # MapsDB (tiles, transições, NPCs)
    │   ├── npcs.js         # NPCsDB
    │   ├── leaders.js      # LeadersDB (bosses)
    │   └── achievements.js # AchievementsDB
    ├── entities/
    │   ├── Creature.js     # Classe Creature (stats, serialização)
    │   ├── Player.js       # Classe PlayerData
    │   └── NPC.js          # Placeholder NPCEntity
    ├── systems/
    │   ├── BattleSystem.js     # Lógica de combate
    │   ├── CaptureSystem.js    # Cálculo de captura
    │   ├── EvolutionSystem.js  # XP, level up, mutação
    │   ├── FusionSystem.js     # Fusão de criaturas
    │   ├── BreedingSystem.js   # Reprodução
    │   ├── EncounterSystem.js  # Encontros aleatórios
    │   ├── AchievementSystem.js
    │   └── SaveSystem.js       # localStorage
    ├── ui/
    │   ├── BattleUI.js
    │   ├── HUD.js
    │   ├── PartyUI.js
    │   ├── InventoryUI.js
    │   └── DialogBox.js
    └── scenes/
        ├── BootScene.js        # Geração de texturas procedurais
        ├── MenuScene.js        # Tela título
        ├── WorldScene.js       # Exploração do mundo
        ├── BattleScene.js      # Combate
        ├── InventoryScene.js   # Menu do jogador
        ├── FusionScene.js
        ├── BreedingScene.js
        └── DialogScene.js
```

---

## 🚀 Como rodar localmente

O jogo usa JavaScript puro com Phaser via CDN — **não precisa de npm ou build**.

Basta servir a pasta com qualquer servidor local. A forma mais simples:

```bash
# Se tiver Python instalado:
python3 -m http.server 8000

# Ou com Node.js (npx):
npx serve .
```

Depois abra `http://localhost:8000` no navegador.

> ⚠️ Não abre direto pelo `index.html` com `file://` pois o Phaser precisa de um servidor HTTP.

---

## 🤝 Como contribuir

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/tumon-game.git
cd tumon-game

# 2. Crie uma branch para sua feature
git checkout -b minha-feature

# 3. Faça suas alterações e commit
git add .
git commit -m "descrição clara do que mudou"

# 4. Envie para o GitHub
git push origin minha-feature

# 5. Abra um Pull Request no GitHub para revisão
```

---

## 📋 O que ainda precisa ser feito

- [ ] Sprites de criaturas (atualmente são retângulos coloridos)
- [ ] Músicas e efeitos sonoros
- [ ] Animações de batalha mais elaboradas
- [ ] Mais mapas e criaturas
- [ ] Tela de seleção de starter animada
- [ ] Sistema de comércio entre jogadores
- [ ] Correção do offset de hitbox dos botões com zoom da câmera

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| [Phaser 3](https://phaser.io/) | Engine do jogo |
| JavaScript ES6 | Toda a lógica |
| HTML5 Canvas | Renderização |
| localStorage | Save do jogo |

---

## 📁 Convenções do projeto

- **Dados** ficam em `src/data/` — adicionar criaturas, moves, mapas é só editar esses arquivos
- **Constantes globais** ficam em `constants.js` — nunca use números mágicos no código
- **Texturas** são geradas proceduralmente em `BootScene.js` via Canvas API
- **Save** é automático a cada 30 segundos e ao trocar de mapa

---

*Projeto em desenvolvimento ativo — MVP v0.1*
