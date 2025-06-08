import { initShadowEngine } from "./shadow-engine.js";
import { buildMultiLayerMap, fetchWallData } from "./mapConstructor.js"; // <-- import buildMultiLayerMap

export const createScene = async (engine, canvas) => {
    const scene = new BABYLON.Scene(engine); // empty scene

    const light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, -1, 0), scene);
    light.position = new BABYLON.Vector3(-10,30,0);

    const ground = buildGround(scene);

    // Fetch map data (multi-layer)
    const mapData = await fetchWallData();

    // Find bounds for all points in all layers
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    if (mapData.layers) {
        mapData.layers.forEach(layer => {
            layer.points.forEach(([x, y]) => {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            });
        });
    }

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const normScale = 20;

    // Normalize all points in all layers
    if (mapData.layers) {
        mapData.layers.forEach(layer => {
            layer.points = layer.points.map(v => [
                rangeX === 0 ? 50 : ((v[0] - minX) / rangeX) * normScale - normScale / 2,
                rangeY === 0 ? 50 : ((v[1] - minY) / rangeY) * normScale - normScale / 2
            ]);
        });
    }

    // Build all layers and ramps
    buildMultiLayerMap(scene, mapData, { layerHeight: 2, wallHeight: 2, wallThickness: 0.5 });

    // shadow stuff
    ground.receiveShadows = true;
    const objects = [];
    initShadowEngine(scene, light, objects);

    buildSkyBox(scene);

    return scene;
}

/******Build Functions***********/
const buildGround = (scene) => {

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:120, height:120});
    ground.material = getGroundMat(scene);

    return ground;
}

const buildHouse = (width) => {
    const box = buildBox(width);
    const roof = buildRoof(width);

    return BABYLON.Mesh.MergeMeshes([box, roof], true, false, null, false, true);
}

const buildBox = (width) => {
    //texture
    const boxMat = new BABYLON.StandardMaterial("boxMat");
    boxMat.backFaceCulling = false
    if (width == 2) {
       boxMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/semihouse.png") 
    }
    else {
        boxMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/cubehouse.png");   
    }

    //options parameter to set different images on each side
    const faceUV = [];
    if (width == 2) {
        faceUV[0] = new BABYLON.Vector4(0.6, 0.0, 1.0, 1.0); //rear face
        faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.4, 1.0); //front face
        faceUV[2] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0); //right side
        faceUV[3] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0); //left side
    }
    else {
        faceUV[0] = new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0); //rear face
        faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.25, 1.0); //front face
        faceUV[2] = new BABYLON.Vector4(0.25, 0, 0.5, 1.0); //right side
        faceUV[3] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0); //left side
    }

    /**** World Objects *****/
    const box = BABYLON.MeshBuilder.CreateBox("box", {width: width, faceUV: faceUV, wrap: true});
    box.material = boxMat;
    box.position.y = 0.5;

    return box;
}

const buildRoof = (width) => {
    //texture
    const roofMat = new BABYLON.StandardMaterial("roofMat");
    roofMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/roof.jpg");
    roofMat.backFaceCulling = false

    const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3});
    roof.material = roofMat;
    roof.scaling.x = 0.75;
    roof.scaling.y = width;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;

    return roof;
}

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
    material.backFaceCulling = false

    return material;
}

const buildSkyBox = (scene) => {
    const skybox = BABYLON.MeshBuilder.CreateBox("skybox", {size: 100.0 }, scene);

    const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;

    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("img/Skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    skybox.material = skyboxMaterial;

    skybox.infiniteDistance = true;


    return skybox;
}

async function loadMap(scene) {
    const wallData = await fetchWallData();
    buildWallsFromArray(scene, wallData);
}