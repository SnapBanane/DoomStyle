import { initShadowEngine } from "./shadow-engine.js";
import { buildWallsFromArray, getWallData } from "./mapConstructor.js";

export const createScene = (engine, canvas) => {
    const scene = new BABYLON.Scene(engine); // empty scene

    const light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, -1, 0), scene);
    light.position = new BABYLON.Vector3(-10,30,0);

    const ground = buildGround(scene);

    const wallDataRaw = getWallData();
    // Find bounds (min/max) for normalization
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    wallDataRaw.forEach(seg => {
        seg.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        });
    });

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    // Normalize to 100x100, avoid division by zero & shift by 50% to make the center (0,0)
    const norm = v => [
        rangeX === 0 ? 50 : ((v[0] - minX) / rangeX) * 100 - 50,
        rangeY === 0 ? 50 : ((v[1] - minY) / rangeY) * 100 - 50
    ];
    const wallData = wallDataRaw.map(seg => [norm(seg[0]), norm(seg[1])]);

    const walls = buildWallsFromArray(scene, wallData, { height: 4, thickness: 0.5 });
    /*
    //create a slope
    const slope = BABYLON.MeshBuilder.CreateCylinder("slope", {diameter: 3, height: 1.2, tessellation: 3});
    slope.position = new BABYLON.Vector3(-10, 0, 0);
    slope.scaling.x = 0.5;
    slope.rotation.z = Math.PI / 2;
    slope.rotation.y = Math.PI / 2;

    //initial instance of house
    const detached_house = buildHouse(1);
    detached_house.rotation.y = -Math.PI / 16;
    detached_house.position.x = -6.8;
    detached_house.position.z = 2.5;

    //initial instance of second building
    const semi_house = buildHouse(2);
    semi_house.rotation.y = -Math.PI / 16;
    semi_house.position.x = -4.5;
    semi_house.position.z = 3;

    const places = []; //each entry is an array [house type, rotation, x, z]
    places.push([2, -Math.PI / 16, -1.5, 4 ]);
    places.push([2, -Math.PI / 3, 1.5, 6 ]);
    places.push([2, 15 * Math.PI / 16, -6.4, -1.5 ]);
    places.push([1, 15 * Math.PI / 16, -4.1, -1 ]);
    places.push([2, 15 * Math.PI / 16, -2.1, -0.5 ]);
    places.push([1, 5 * Math.PI / 4, 0, -1 ]);
    places.push([1, Math.PI + Math.PI / 2.5, 0.5, -3 ]);
    places.push([2, Math.PI + Math.PI / 2.1, 0.75, -5 ]);
    places.push([1, Math.PI + Math.PI / 2.25, 0.75, -7 ]);
    places.push([2, Math.PI / 1.9, 4.75, -1 ]);
    places.push([1, Math.PI / 1.95, 4.5, -3 ]);
    places.push([2, Math.PI / 1.9, 4.75, -5 ]);
    places.push([1, Math.PI / 1.9, 4.75, -7 ]);
    places.push([2, -Math.PI / 3, 5.25, 2 ]);
    places.push([1, -Math.PI / 3, 6, 4 ]);

    const houses = [];
    for (let i = 0; i < places.length; i++) {
        if (places[i][0] === 1) {
            houses[i] = detached_house.createInstance("house" + i);
        }
        else {
            houses[i] = semi_house.createInstance("house" + i);
        }
        houses[i].rotation.y = places[i][1];
        houses[i].position.x = places[i][2];
        houses[i].position.z = places[i][3];
    }
        */

    // shadow stuff
    ground.receiveShadows = true;
    // const objects = [detached_house, semi_house, ...houses];
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