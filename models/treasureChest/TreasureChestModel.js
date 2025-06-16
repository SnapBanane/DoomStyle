// models/treasureChest/TreasureChestModel.js
export function createTreasureChestModel(scene) {
    // Create root container for the chest
    const container = new BABYLON.TransformNode("chestContainer", scene);

    // --- Create materials ---
    const woodMat = new BABYLON.StandardMaterial("woodMat", scene);
    woodMat.diffuseTexture = new BABYLON.Texture("./img/textures/wood.jpg", scene); // Replace with your wood texture
    woodMat.diffuseTexture.uScale = 1; // Adjust tiling
    woodMat.diffuseTexture.vScale = 1;

    const metalMat = new BABYLON.StandardMaterial("metalMat", scene);
    metalMat.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.2); // Gold color
    metalMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    metalMat.diffuseTexture = new BABYLON.Texture("./img/textures/gold.webp", scene); // Replace with your metal texture
    metalMat.specularPower = 64;

    // --- Create the base ---
    const base = BABYLON.MeshBuilder.CreateBox("chestBase", {
        width: 1,
        height: 0.6,
        depth: 0.8,
    }, scene);
    base.material = woodMat;
    base.position.y = 0.3;
    base.parent = container;

    // --- Create the lid ---
    const lidContainer = new BABYLON.TransformNode("lidContainer", scene);
    lidContainer.parent = container;
    lidContainer.position.y = 0.5;
    lidContainer.rotation.x = -(Math.PI / 2); // Start closed

    // Curved part of the lid
    const lidCurvedPart = BABYLON.MeshBuilder.CreateCylinder("lidCurvedPart", {
        diameter: 0.8,
        height: 3.3,
        tessellation: 32,
        arc: 0.5, // half cylinder
    }, scene);
    lidCurvedPart.material = woodMat;
    lidCurvedPart.rotation.x = Math.PI;
    lidCurvedPart.rotation.z = Math.PI / 2;
    lidCurvedPart.position.z = 0.05;
    lidCurvedPart.scaling.y = 0.3;
    lidCurvedPart.parent = lidContainer;

    // Add a plate under the lid to block the view from below when open
    const lidPlate = BABYLON.MeshBuilder.CreateBox("lidPlate", {
        width: 0.8, // match lid width
        height: 0.02, // thin plate
        depth: 0.8, // match lid depth
    }, scene);
    lidPlate.material = woodMat;
    lidPlate.parent = lidContainer;
    lidPlate.position.y = -0.13; // just under the curved part
    lidPlate.position.z = 0.05; // align with lid

    // Rim of the lid (front)
    const lidRimFront = BABYLON.MeshBuilder.CreateTorus("lidRimFront", {
        diameter: 0.83,
        thickness: 0.08,
        tessellation: 32
    }, scene);
    lidRimFront.material = metalMat;
    lidRimFront.rotation.z = Math.PI / 2;
    lidRimFront.position.z = 0.05;
    lidRimFront.position.x = 0.47;
    lidRimFront.parent = lidContainer;

    // Rim of the lid (back)
    const lidRimBack = BABYLON.MeshBuilder.CreateTorus("lidRimBack", {
        diameter: 0.83,
        thickness: 0.08,
        tessellation: 32
    }, scene);
    lidRimBack.material = metalMat;
    lidRimBack.rotation.z = Math.PI / 2;
    lidRimBack.position.z = 0.05;
    lidRimBack.position.x = -0.47;
    lidRimBack.parent = lidContainer;

    // Metal trim at the base (front)
    const baseTrimFront = BABYLON.MeshBuilder.CreateBox("baseTrimFront", {
        width: 1.01,
        height: 0.08,
        depth: 0.08
    }, scene);
    baseTrimFront.material = metalMat;
    baseTrimFront.position.y = -0.25;
    baseTrimFront.position.z = 0.39;
    baseTrimFront.parent = base;

    // Metal trim at the base (back)
    const baseTrimBack = BABYLON.MeshBuilder.CreateBox("baseTrimBack", {
        width: 1.01,
        height: 0.08,
        depth: 0.08
    }, scene);
    baseTrimBack.material = metalMat;
    baseTrimBack.position.y = -0.25;
    baseTrimBack.position.z = -0.39;
    baseTrimBack.parent = base;

    // Metal trim at the base (left side)
    const baseTrimLeft = BABYLON.MeshBuilder.CreateBox("baseTrimLeft", {
        width: 0.08,
        height: 0.08,
        depth: 0.8
    }, scene);
    baseTrimLeft.material = metalMat;
    baseTrimLeft.position.y = -0.25;
    baseTrimLeft.position.x = -0.465;
    baseTrimLeft.parent = base;

    // Metal trim at the base (right side)
    const baseTrimRight = BABYLON.MeshBuilder.CreateBox("baseTrimRight", {
        width: 0.08,
        height: 0.08,
        depth: 0.8
    }, scene);
    baseTrimRight.material = metalMat;
    baseTrimRight.position.y = -0.25;
    baseTrimRight.position.x = 0.465;
    baseTrimRight.parent = base;

    // Vertical trims on the four base corners
    const baseTrimCornerFL = BABYLON.MeshBuilder.CreateBox("baseTrimCornerFL", {
        width: 0.08,
        height: 0.6,
        depth: 0.08
    }, scene);
    baseTrimCornerFL.material = metalMat;
    baseTrimCornerFL.position.x = -0.47;
    baseTrimCornerFL.position.y = 0;
    baseTrimCornerFL.position.z = 0.39;
    baseTrimCornerFL.parent = base;

    const baseTrimCornerFR = BABYLON.MeshBuilder.CreateBox("baseTrimCornerFR", {
        width: 0.08,
        height: 0.6,
        depth: 0.08
    }, scene);
    baseTrimCornerFR.material = metalMat;
    baseTrimCornerFR.position.x = 0.47;
    baseTrimCornerFR.position.y = 0;
    baseTrimCornerFR.position.z = 0.39;
    baseTrimCornerFR.parent = base;

    const baseTrimCornerBL = BABYLON.MeshBuilder.CreateBox("baseTrimCornerBL", {
        width: 0.08,
        height: 0.6,
        depth: 0.08
    }, scene);
    baseTrimCornerBL.material = metalMat;
    baseTrimCornerBL.position.x = -0.47;
    baseTrimCornerBL.position.y = 0;
    baseTrimCornerBL.position.z = -0.39;
    baseTrimCornerBL.parent = base;

    const baseTrimCornerBR = BABYLON.MeshBuilder.CreateBox("baseTrimCornerBR", {
        width: 0.08,
        height: 0.6,
        depth: 0.08
    }, scene);
    baseTrimCornerBR.material = metalMat;
    baseTrimCornerBR.position.x = 0.47;
    baseTrimCornerBR.position.y = 0;
    baseTrimCornerBR.position.z = -0.39;
    baseTrimCornerBR.parent = base;

    // --- Create the lock ---
    const lock = BABYLON.MeshBuilder.CreateBox("lock", {
        width: 0.2,
        height: 0.3,
        depth: 0.1
    }, scene);
    lock.material = metalMat;
    lock.position.y = 0.4;
    lock.position.z = 0;
    lock.rotation.x = -(Math.PI / 2); // Rotate to align with lid
    lock.parent = lidContainer;

     // Keyhole
     const keyhole = BABYLON.MeshBuilder.CreateCylinder("keyhole", {
        diameter: 0.04,
        height: 0.02,
        tessellation: 16
    }, scene);
    const keyholeMat = new BABYLON.StandardMaterial("keyholeMat", scene);
    keyholeMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    keyhole.material = keyholeMat;
    keyhole.position.y = -0.05; // moved up to center on the lock
    keyhole.position.z = 0.055; // moved forward to be flush with lock front
    keyhole.rotation.x = Math.PI / 2; // Rotate 90 degrees
    keyhole.parent = lock;

    // --- Create coins (using lathe) ---
    const coinProfile = [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0.02, 0, 0),
        new BABYLON.Vector3(0.02, 0.05, 0),
        new BABYLON.Vector3(0, 0.05, 0)
    ];

    const coin = BABYLON.MeshBuilder.CreateLathe("coin", {
        shape: coinProfile,
        radius: 0.5,
        tessellation: 32
    }, scene);
    coin.material = metalMat;
    coin.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    coin.rotation.x = Math.PI / 2;
    coin.position.y = 0.7;
    coin.position.z = 0;
    coin.parent = container;

    // Add glow function before openLid
    container.setGlow = function(intensity) {
        const glowColor = new BABYLON.Color3(0.8, 0.7, 0.2);
        woodMat.emissiveColor = glowColor.scale(intensity * 0.1);
        metalMat.emissiveColor = glowColor.scale(intensity * 0.4);
    };

    // --- Opening animation ---
    container.openLid = function() {
        // Create the animation
        const anim = new BABYLON.Animation(
            "chestOpen",
            "rotation.x",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        // Define keyframes
        const keyFrames = [];
        keyFrames.push({
            frame: 0,
            value: Math.PI / 3 // Start from closed position
        });
        keyFrames.push({
            frame: 10,
            value: 0 // Open to this position
        });

        anim.setKeys(keyFrames);

        // Simple easing function
        const easingFunction = new BABYLON.QuadraticEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        anim.setEasingFunction(easingFunction);

        // Start the animation using lidContainer instead of lid
        lidContainer.animations = [anim];
        scene.beginAnimation(lidContainer, 0, 10, false);

        // Glow effect when opening
        container.setGlow(1);
        setTimeout(() => container.setGlow(0), 500);
    };

    container.lid = lidContainer;
    container.base = base;

    return container;
}
