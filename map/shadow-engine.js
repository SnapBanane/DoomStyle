export const initShadowEngine = (scene, light, objects) => {
    // Create a shadow generator
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    
    shadowGenerator.blurKernel = 32;

    // Add each object to the shadow generator and set it to receive shadows
    objects.forEach(obj => {
        shadowGenerator.addShadowCaster(obj);
    });

    return scene;
} 