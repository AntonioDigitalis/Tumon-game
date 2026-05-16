function safeImageLoadWithFallback(scene, key, path, fallback = 'asset_missing') {

    // evita duplicar listener
    if (!scene.__imageLoadErrorHooked) {
        scene.load.on('loaderror', (file) => {

            Log.error(`Falha ao carregar: ${file.key}`);
            Log.warn(`Usando fallback: ${fallback}`);

            if (!scene.textures.exists(fallback)) {
                const g = scene.add.graphics();
                g.fillStyle(0xff0000, 1);
                g.fillRect(0, 0, 32, 32);
                g.generateTexture(fallback, 32, 32);
                g.destroy();
            }
        });

        scene.__imageLoadErrorHooked = true;
    }

    // registra imagem normalmente
    scene.load.image(key, path);

    Log.info(`Registrado: ${key}`);
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
    return scene.textures.exists(key)
        ? key
        : 'asset_missing';
}