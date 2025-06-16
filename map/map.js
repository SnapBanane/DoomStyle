// Ensure Babylon.js and Earcut are available
if (window.BABYLON && window.earcut) {
  window.BABYLON.Earcut = window.earcut;
} else {
  // Wait for both to be available before assigning
  const waitForBabylonAndEarcut = setInterval(() => {
    if (window.BABYLON && window.earcut) {
      window.BABYLON.Earcut = window.earcut;
      clearInterval(waitForBabylonAndEarcut);
    }
  }, 10);
}

import { initShadowEngine } from "./shadow-engine.js";
import { treasureChest } from "./treasureChest.js";
import {
  buildMultiLayerMap,
  fetchWallData,
  buildEnemyMap,
} from "./mapConstructor.js"; // <-- import buildMultiLayerMap

export const createScene = async (scene, canvas) => {
  const hemiLight = new BABYLON.HemisphericLight(
    "hemiLight",
    new BABYLON.Vector3(0, 1, 0),
    scene,
  );
  hemiLight.intensity = 0.5;

  const sun = buildSun(scene);

  const ground = buildGround(scene);
  ground.receiveShadows = true;

  const mapData = await getMapData();

  // construct map meshes with the scaled map data
  const mapMeshes = buildMultiLayerMap(scene, mapData, {
    layerHeight: 2,
    wallHeight: 2,
    wallThickness: 0.5,
  });

  const objects = [...mapMeshes]; // flatten the array (this needs to be done because buildMultiLayerMap returns an array of arrays)
  const lights = [sun, hemiLight];
  initShadowEngine(scene, lights, objects);

  buildSkyBox(scene);

  return scene;
};

/******Build Functions***********/
const buildGround = (scene) => {
  const ground = BABYLON.MeshBuilder.CreateGround("ground", {
    width: 120,
    height: 120,
  });
  ground.material = getGroundMat(scene);

  return ground;
};

const getGroundMat = (scene) => {
  const material = new BABYLON.StandardMaterial("material", scene);

  // set size of texture
  //
  const scale = 80;
  //
  // make the texture repeat {scale} times

  const texture = new BABYLON.Texture("img/textures/ground.jpg", scene);
  texture.uScale = scale;
  texture.vScale = scale;

  material.diffuseTexture = texture;
  material.backFaceCulling = false;

  return material;
};

const buildSkyBox = (scene) => {
  const skybox = BABYLON.MeshBuilder.CreateBox(
    "skybox",
    { size: 100.0 },
    scene,
  );

  const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.disableLighting = true;

  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
    "img/Skybox/skybox",
    scene,
  );
  skyboxMaterial.reflectionTexture.coordinatesMode =
    BABYLON.Texture.SKYBOX_MODE;

  skybox.material = skyboxMaterial;

  skybox.infiniteDistance = true;

  return skybox;
};

function scaleMap(mapData, scale) {
  if (mapData.layers) {
    mapData.layers.forEach((layer) => {
      layer.points = layer.points.map((v) => [v[0] * scale + 2, v[1] * scale]);
    });
  }

  if (mapData.ramps) {
    mapData.ramps = mapData.ramps.map((ramp) => ({
      ...ramp,
      x: ramp.x * scale + 2,
      y: ramp.y * scale,
    }));
  }

  if (mapData.enemies) {
    mapData.enemies = mapData.enemies.map((enemy) => ({
      ...enemy,
      x: enemy.x * scale + 2,
      y: enemy.y * scale,
    }));
  }

  return mapData;
}

function buildSun(scene) {
  const sun = new BABYLON.DirectionalLight(
    "sun",
    new BABYLON.Vector3(-1, -2, -1),
    scene,
  );
  sun.position = new BABYLON.Vector3(20, 40, 20);
  sun.intensity = 0.7;

  const sunDir = new BABYLON.Vector3(-0.638, 0.468, 0.612).normalize();
  const sunDistance = 100;

  if (sun) {
    sun.position = sunDir.scale(sunDistance);
    sun.direction = sunDir.negate(); // turn the vector
  }

  return sun;
}

const getMapData = async () => {
  // fetch map data then rescale
  const mapData = await fetchWallData();
  const scale = 0.05;

  const scaledData = scaleMap(mapData, scale);

  return scaledData;
};

export const initEnemies = async (scene) => {
  const mapData = await getMapData();
  return buildEnemyMap(scene, mapData);
};
