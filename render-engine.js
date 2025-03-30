import { createScene } from './map.js';
import { setupPlayerControls } from './player.js';
import { GUI } from './gui.js';
import './DevKit/console.js';
import HavokPhysics from "https://cdn.babylonjs.com/havok/HavokPhysics_es.js";

window.addEventListener('DOMContentLoaded', async function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);

    // Initialize Havok physics
    const havokInstance = await HavokPhysics();
    const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);

    const scene = createScene(engine, canvas);

    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

    initBodyPhysics(scene);

    const player = BABYLON.MeshBuilder.CreateBox("player", { width: 1, height: 1.2, depth: 1}, scene);
    player.position = new BABYLON.Vector3(0, 5, 0);

    const playerAggregate = new BABYLON.PhysicsAggregate(
        player,
        BABYLON.PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.2, friction: 1, inertia: BABYLON.Vector3.ZeroReadOnly},
        scene
    );
    
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    setupPlayerControls(scene, player, camera);

    GUI();

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Browser Resize event call
    window.addEventListener("resize", function () {
        engine.resize();
    });
});

function initBodyPhysics(scene) {
    scene.meshes.forEach(element => {
        let shapeType = BABYLON.PhysicsShapeType.BOX; // Default to BOX
        if (element.name && element.name.toLowerCase().includes("sphere")) {
            shapeType = BABYLON.PhysicsShapeType.SPHERE;
        } else if (element.name && element.name.toLowerCase().includes("mesh")) {
            shapeType = BABYLON.PhysicsShapeType.MESH;
        } else {
            shapeType = BABYLON.PhysicsShapeType.MESH;
        }
        const mass = 0;
        const restitution = 0.2;

        new BABYLON.PhysicsAggregate(element, shapeType, { mass: mass, restitution: restitution }, scene);
        element.chechCollisions = true;
    });
}