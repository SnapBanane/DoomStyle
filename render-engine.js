import { createScene } from './map.js';
import { setupPlayerControls } from './player.js';
import './DevKit/console.js';
import HavokPhysics from "https://cdn.babylonjs.com/havok/HavokPhysics_es.js";

window.addEventListener('DOMContentLoaded', async function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);

    // Initialize Havok physics
    const havokInstance = await HavokPhysics();
    const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);

    const scene = createScene(engine, canvas)

    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

    initBodyPhysics(scene);

    const player = BABYLON.MeshBuilder.CreateBox("player", { width: 0.5, height: 1, depth: 0.5}, scene);
    player.position = new BABYLON.Vector3(0, 5, 0);

    const playerAggregate = new BABYLON.PhysicsAggregate(
        player,
        BABYLON.PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.2, friction: 0.5 },
        scene
    );

    // Apply aggregate to body
    const playerBody = playerAggregate.body;

    // Create and position a free camera
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    camera.parent = player;

    setupPlayerControls(scene, player, camera);

    let isJumping = false;
    window.addEventListener("keydown", (event) => {
        if (event.code === "Space" && !isJumping) {
            isJumping = true;
            playerBody.applyImpulse(new BABYLON.Vector3(0, 5, 0), player.getAbsolutePosition());
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (playerBody.getLinearVelocity().y === 0) {
            isJumping = false;
        }
    });

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
        // Determine the shape type based on the object
        let shapeType = BABYLON.PhysicsShapeType.BOX; // Default to BOX
        if (element.name && element.name.toLowerCase().includes("sphere")) {
            shapeType = BABYLON.PhysicsShapeType.SPHERE;
        } else if (element.name && element.name.toLowerCase().includes("mesh")) {
            shapeType = BABYLON.PhysicsShapeType.MESH; // Use MESH for non-box/sphere objects
        } else {
            shapeType = BABYLON.PhysicsShapeType.MESH; // Fallback to MESH for unknown types
        }

        // Set mass and restitution for all objects
        const mass = 0; // Static objects
        const restitution = 0.2; // Slight bounce for all objects

        // Create a PhysicsAggregate for the object
        new BABYLON.PhysicsAggregate(element, shapeType, { mass: mass, restitution: restitution }, scene);
    });
}