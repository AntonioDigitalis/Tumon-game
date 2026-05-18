
function ensureProceduralFallback(scene, creatureKey) {

    const procKey = `proc_${creatureKey}`;

    if (scene.textures.exists(procKey)) {
        return procKey;
    }

    // tenta achar na DB pra gerar certo
    const creature = CreaturesDB[creatureKey];
    if (!creature) return 'asset_missing';

    CreatureSprites._draw(
        scene,
        procKey,
        creature.element,
        creature.variant || 0,
        creature.bodyColor || 0x888888,
        creature.eyeColor || 0xffffff
    );

    return procKey;
}

function safeImageLoadWithFallback(scene, key, path) {
    // Guarda no game (compartilhado entre cenas) para que getSpriteKey
    // em qualquer cena saiba quais PNGs falharam
    scene.load.image(key, path);

    scene.load.on('loaderror', (file) => {
        if (!scene.game.__missingAssets) scene.game.__missingAssets = new Set();
        scene.game.__missingAssets.add(file.key);
    });
}

const ItemAssetLoader = {
    loadAll(scene) {

        const items = ItemsDB;

        Object.values(items).forEach(item => {
            if (item.icon){
                const path = `assets/items/${item.icon}.png`;
                safeImageLoadWithFallback(scene, item.icon, path);
            }
        });

        Log.ok(`Itens registrados: ${Object.keys(items).length}`);
    }
};

const SpriteAssetLoader = {
    loadAll(scene) {
        const criaturas = CreaturesDB;

        Object.values(criaturas).forEach(criatura => {

            if (criatura.spriteKey) {
                const path = `assets/sprites/${criatura.spriteKey}.png`;
                safeImageLoadWithFallback(scene, criatura.spriteKey, path);
            }

            if (criatura.spriteShinyKey) {
                const shinyPath = `assets/sprites/${criatura.spriteShinyKey}.png`;
                safeImageLoadWithFallback(scene, criatura.spriteShinyKey, shinyPath);
            }
        });

        Log.ok(`Sprites registradas: ${Object.keys(criaturas).length}`);
       }
};

function getSpriteKey(scene, key) {
    if (!key) return 'asset_missing';

    // --------------------------
    // tenta sprite PNG primeiro
    // --------------------------
    const tex = scene.textures.get(key);

    if (
        tex &&
        tex.key !== '__MISSING' &&
        tex.source &&
        tex.source[0] &&
        tex.source[0].width > 0 &&
        tex.source[0].height > 0
    ) {
        return key;
    }

    // --------------------------
    // fallback procedural
    // --------------------------
    const procKey = `proc_${key}`;
    if (scene.textures.exists(procKey)) return procKey;

    // Gera procedural sob demanda (shiny usa dados da forma base)
    const template = CreaturesDB[key] || CreaturesDB[key.replace(/_shiny$/, '')];
    if (!template) return 'asset_missing';

    CreatureSprites._draw(
        scene,
        procKey,
        template.element,
        template.variant || 0,
        template.spriteColor || 0x888888,
        template.eyeColor    || 0xffffff
    );

    return procKey;
}