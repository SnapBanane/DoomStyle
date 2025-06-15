export const initShadowEngine = (scene, lights, objects) => {
  // Accept an array of lights
  if (!Array.isArray(lights)) lights = [lights];

  // Store shadow generators for possible further tuning
  const shadowGenerators = [];

  lights.forEach((light) => {
    // Only create shadows for lights that support it
    if (
      light instanceof BABYLON.DirectionalLight ||
      light instanceof BABYLON.SpotLight
    ) {
      const shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
      shadowGenerator.useBlurExponentialShadowMap = true;
      shadowGenerator.blurKernel = 32;
      shadowGenerator.setDarkness(0.4); // Softer, more realistic shadow

      objects.forEach((obj) => {
        shadowGenerator.addShadowCaster(obj);
      });

      shadowGenerators.push(shadowGenerator);
    }
  });

  // Optionally, set all objects to receive shadows
  objects.forEach((obj) => {
    obj.receiveShadows = true;
  });

  // Add a hemispheric light for ambient fill if not present
  if (!scene.lights.some((l) => l instanceof BABYLON.HemisphericLight)) {
    const hemi = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      scene,
    );
    hemi.intensity = 0.4;
  }

  return { shadowGenerators };
};
