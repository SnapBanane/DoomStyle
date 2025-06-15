function createHead(scene, parent) {
    const head = BABYLON.MeshBuilder.CreateBox("head", {
        size: 0.4
    }, scene);
    head.parent = parent;
    head.position.y = 0.6;
    head.material = createNinjaMaterial(scene);
    return head;
}

function createTorso(scene) {
    const torso = BABYLON.MeshBuilder.CreateBox("torso", {
        height: 0.8,
        width: 0.6,
        depth: 0.4
    }, scene);
    torso.position.y = 1;
    torso.material = createNinjaMaterial(scene);
    return torso;
}

function createArm(scene, parent, isRight = true) {
    const arm = BABYLON.MeshBuilder.CreateBox(`${isRight ? 'right' : 'left'}Arm`, {
        height: 0.6,
        width: 0.2,
        depth: 0.2
    }, scene);
    arm.parent = parent;
    arm.position = new BABYLON.Vector3(isRight ? 0.4 : -0.4, 0.1, 0);
    arm.material = createNinjaMaterial(scene);
    return arm;
}

function createLegJoint(scene, parent, isRight = true) {
    // Create a TransformNode as the joint at the bottom of the torso
    const joint = new BABYLON.TransformNode(isRight ? "rightLegJoint" : "leftLegJoint", scene);
    joint.parent = parent;
    joint.position = new BABYLON.Vector3(isRight ? 0.15 : -0.15, -0, 0); // bottom of torso (torso height/2 = 0.4)
    return joint;
}

function createLeg(scene, parent, isRight = true) {
    // Parent the leg to the joint, not directly to the torso
    const leg = BABYLON.MeshBuilder.CreateBox(`${isRight ? 'right' : 'left'}Leg`, {
        height: 0.8,
        width: 0.3,
        depth: 0.2
    }, scene);
    leg.parent = parent; // parent is the joint
    leg.position = new BABYLON.Vector3(0, -0.4, 0); // half leg height down from joint
    leg.material = createNinjaMaterial(scene);
    return leg;
}

function createSword(scene, rightArm) {
    const sword = BABYLON.MeshBuilder.CreateBox("sword", {
        height: 0.8,
        width: 0.1,
        depth: 0.05
    }, scene);
    sword.parent = rightArm;
    sword.position = new BABYLON.Vector3(0, -0.6, 0);
    
    const swordMaterial = new BABYLON.StandardMaterial("swordMat", scene);
    swordMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    swordMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    sword.material = swordMaterial;
    
    return sword;
}

function createNinjaMaterial(scene) {
    const material = new BABYLON.StandardMaterial("ninjaMat", scene);
    material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    return material;
}

export function createNinjaEnemy(scene) {
    const enemy = new BABYLON.TransformNode("ninjaEnemy", scene);

    const torso = createTorso(scene);
    torso.parent = enemy;

    const head = createHead(scene, torso);
    const rightArm = createArm(scene, torso, true);
    const leftArm = createArm(scene, torso, false);

    // Create leg joints at the bottom of the torso
    const rightLegJoint = createLegJoint(scene, torso, true);
    const leftLegJoint = createLegJoint(scene, torso, false);

    // Legs are now parented to their respective joints
    const rightLeg = createLeg(scene, rightLegJoint, true);
    const leftLeg = createLeg(scene, leftLegJoint, false);

    const sword = createSword(scene, rightArm);

    return {
        root: enemy,
        torso,
        head,
        rightArm,
        leftArm,
        rightLeg,
        leftLeg,
        rightLegJoint,
        leftLegJoint,
        sword
    };
}