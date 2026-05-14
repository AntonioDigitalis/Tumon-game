function safeImageLoadWithFallback(scene, key, path, fallback = 'asset_missing') {

    scene.load.image(key, path);

    scene.load.on('loaderror', (file) => {

        if (file.key === key) {
            Log.error(`Falha ao carregar: ${key}`);
            Log.warn(`Usando fallback: ${fallback}`);

            // cria placeholder automático
            if (!scene.textures.exists(fallback)) {
                scene.add.graphics()
                    .fillStyle(0xff0000, 1)
                    .fillRect(0, 0, 32, 32)
                    .generateTexture(fallback, 32, 32);
            }

            scene.textures.remove(key);
        }
    });

    Log.info(`Registrado: ${key}`);
}

const ItemAssetLoader = {
    loadAll(scene) {

        const items = ItemsDB;

        Object.values(items).forEach(item => {
            if (!item.icon) return;

            const path = `assets/items/${item.icon}.png`;

            safeImageLoadWithFallback(scene, item.icon, path);
        });

        Log.ok(`Itens registrados: ${Object.keys(items).length}`);
    }
};