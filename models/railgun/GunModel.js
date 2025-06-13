// TurretGun.js
export function createTurretGun(scene) {
    const turret = new BABYLON.TransformNode("turret", scene);
    
    // Base mount - wider, armored cylinder
    const baseMount = BABYLON.MeshBuilder.CreateCylinder("baseMount", {
        height: 0.3,
        diameter: 1.2,
        tessellation: 12
    }, scene);
    baseMount.material = new BABYLON.StandardMaterial("baseMat", scene);
    baseMount.material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    baseMount.checkCollisions = true;
    baseMount.parent = turret;

    // Rotating platform
    const gunPivot = new BABYLON.TransformNode("gunPivot", scene);
    gunPivot.position.y = 0.15;
    gunPivot.parent = turret;

    // Main body housing - octagonal prism
    const mainBody = BABYLON.MeshBuilder.CreateCylinder("mainBody", {
        height: 0.6,
        diameter: 0.8,
        tessellation: 8
    }, scene);
    mainBody.material = new BABYLON.StandardMaterial("bodyMat", scene);
    mainBody.material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
    mainBody.checkCollisions = true;
    mainBody.position.y = 0.1;
    mainBody.parent = gunPivot;

    // Armor plates
    const createArmorPlate = (name, pos, rot, scale) => {
        const plate = BABYLON.MeshBuilder.CreateBox(name, {
            width: 0.4, height: 0.3, depth: 0.05
        }, scene);
        plate.position = pos;
        plate.rotation = rot;
        plate.scaling = scale;
        plate.checkCollisions = true;
        plate.material = new BABYLON.StandardMaterial("armorMat", scene);
        plate.material.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.45);
        plate.parent = gunPivot;
        return plate;
    };

    // Add side armor plates
    createArmorPlate("leftArmor", new BABYLON.Vector3(-0.35, 0.1, 0), new BABYLON.Vector3(0, 0, 0.1), new BABYLON.Vector3(1, 1, 1));
    createArmorPlate("rightArmor", new BABYLON.Vector3(0.35, 0.1, 0), new BABYLON.Vector3(0, 0, -0.1), new BABYLON.Vector3(1, 1, 1));

    // Main gun assembly
    const gunAssembly = new BABYLON.TransformNode("gunAssembly", scene);
    gunAssembly.parent = gunPivot;
    
    // Main barrel (thicker for railgun)
    const mainBarrel = BABYLON.MeshBuilder.CreateCylinder("mainBarrel", {
        height: 2.5,
        diameter: 0.25,
        tessellation: 16
    }, scene);
    mainBarrel.position = new BABYLON.Vector3(0, 0.15, 1);
    mainBarrel.rotation.x = Math.PI / 2;
    mainBarrel.checkCollisions = true;
    mainBarrel.material = new BABYLON.StandardMaterial("barrelMat", scene);
    mainBarrel.material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    mainBarrel.parent = gunAssembly;

    // Electromagnetic coils around the barrel
    const createCoil = (position) => {
        const coil = BABYLON.MeshBuilder.CreateTorus("coil", {
            diameter: 0.4,
            thickness: 0.08,
            tessellation: 20
        }, scene);
        coil.position = position;
        coil.rotation.x = Math.PI / 2;
        coil.material = new BABYLON.StandardMaterial("coilMat", scene);
        coil.material.diffuseColor = new BABYLON.Color3(0.4, 0.1, 0.1);
        coil.parent = gunAssembly;
        
        // Add glow effect to coils
        const glowLayer = new BABYLON.GlowLayer("glow", scene);
        glowLayer.addIncludedOnlyMesh(coil);
        glowLayer.intensity = 0.5;
    };

    // Create multiple coils along the barrel
    [-0.2, 0.2, 0.6, 1.0].forEach(z => {
        createCoil(new BABYLON.Vector3(0, 0.15, z));
    });

    // Energy conduits (tubes along the sides)
    const createConduit = (offset) => {
        const conduit = BABYLON.MeshBuilder.CreateCylinder("conduit", {
            height: 2,
            diameter: 0.08,
            tessellation: 12
        }, scene);
        conduit.position = new BABYLON.Vector3(offset, 0.15, 0.8);
        conduit.rotation.x = Math.PI / 2;
        conduit.material = new BABYLON.StandardMaterial("conduitMat", scene);
        conduit.material.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.6);
        conduit.material.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.6);
        conduit.parent = gunAssembly;
    };

    createConduit(0.2);
    createConduit(-0.2);

    // Muzzle device (energy focuser)
    const muzzle = BABYLON.MeshBuilder.CreateCylinder("muzzle", {
        height: 0.4,
        diameterTop: 0.5,
        diameterBottom: 0.3,
        tessellation: 16
    }, scene);
    muzzle.position = new BABYLON.Vector3(0, 0.15, 2);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.material = new BABYLON.StandardMaterial("muzzleMat", scene);
    muzzle.material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    muzzle.parent = gunAssembly;

    return {
        root: turret,
        gunPivot: gunPivot,
        mainBody: mainBody,
        gunAssembly: gunAssembly
    };
}
