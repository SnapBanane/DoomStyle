import { enemyDeath } from "./enemyDeath.js";
import { damagePlayer } from "../map/GUI.js";
import { createNinjaEnemy } from "../models/enemy-0/enemy-0_Model.js";

export function aiForEnemy0(scene, x, y, z, id) {
  const player = scene.getMeshByName("player");

  // Create root node for the enemy
  const enemyRoot = new BABYLON.TransformNode("enemyRoot", scene);
  enemyRoot.position = new BABYLON.Vector3(x, y, z);
  enemyRoot.scaling = new BABYLON.Vector3(0.7, 0.7, 0.7); // Scale down the entire enemy

  // Create the enemy model (returns an object with all parts)
  const model = createNinjaEnemy(scene);

  // Parent the main model root to the enemyRoot
  model.root.parent = enemyRoot;

  // Create hitbox and parent it to the root
  const hitBox = BABYLON.MeshBuilder.CreateBox(
    "enemyHitbox",
    { width: 1, height: 1, depth: 1 },
    scene
  );
  hitBox.isVisible = false;
  hitBox.position = new BABYLON.Vector3(0, 0, 0);
  hitBox.parent = enemyRoot;

  // Assign the map id to a custom property on both meshes
  if (id !== undefined) {
    enemyRoot.gameId = id;
    hitBox.gameId = id;
  }

  // Apply physics to the hitbox
  const physicsAggregate = new BABYLON.PhysicsAggregate(
    hitBox,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 1, restitution: 0.2, friction: 1 },
    scene
  );

  let lastDamageTime = 0;
  const damageCooldown = 500;

  // Movement, rotation, and attack logic
  enemyRoot.isRotating = true;
  enemyRoot.rotation = new BABYLON.Vector3(0, 0, 0);

  // Animation state for right arm and legs
  let armAngle = 0;
  let armDirection = 1;
  let legAngle = 0;
  let legDirection = 1;

  scene.onBeforeRenderObservable.add(() => {
    if (!player) return;

    // Movement and rotation logic
    const direction = player.position.subtract(enemyRoot.position).normalize();

    // Movement and physics using hitbox
    if (physicsAggregate.body) {
      const force = direction.scale(5);
      physicsAggregate.body.applyForce(force, hitBox.position);
    }

    // Invert rotation to face the opposite direction
    if (enemyRoot.isRotating) {
      const angle = Math.atan2(direction.z, direction.x);
      enemyRoot.rotation.y = -(angle - Math.PI / 2);
    }

    // Animate right arm from 0 to -90 degrees (0 to -Math.PI/2)
    if (model.rightArm) {
      armAngle += 0.03 * armDirection;
      if (armAngle < -Math.PI / 2) {
        armAngle = -Math.PI / 2;
        armDirection = 1;
      }
      if (armAngle > 0) {
        armAngle = 0;
        armDirection = -1;
      }
      model.rightArm.rotation.x = armAngle;
    }

    // Animate legs in opposite phase to each other
    if (model.rightLeg && model.leftLeg) {
      legAngle += 0.03 * legDirection;
      if (legAngle > Math.PI / 6) {
        legAngle = Math.PI / 6;
        legDirection = -1;
      }
      if (legAngle < -Math.PI / 6) {
        legAngle = -Math.PI / 6;
        legDirection = 1;
      }
      model.rightLeg.rotation.x = legAngle;
      model.leftLeg.rotation.x = -legAngle;
    }

    // Ray check for player contact
    const rayOrigin = enemyRoot.position;
    const rayLength = 1.2;
    const ray = new BABYLON.Ray(rayOrigin, direction, rayLength);

    const hit = scene.pickWithRay(ray, (mesh) => mesh.name === "player");
    if (hit && hit.pickedMesh && hit.pickedMesh.name === "player") {
      const now = Date.now();
      if (now - lastDamageTime >= damageCooldown) {
        damagePlayer(10);
        lastDamageTime = now;
      }
    }

    enemyDeath(enemyRoot, 50);
  });

  // Add rotation toggle function
  enemyRoot.toggleRotation = () => {
    enemyRoot.isRotating = !enemyRoot.isRotating;
    console.log(
      `Enemy rotation ${enemyRoot.isRotating ? "enabled" : "disabled"}`
    );
  };

  // Optional: expose toggle to window for testing
  enemyRoot.toggleRotationKey = (key = "r") => {
    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === key.toLowerCase()) {
        enemyRoot.toggleRotation();
      }
    });
  };

  // Example: enable 'r' key to toggle rotation
  enemyRoot.toggleRotationKey("r");

  return enemyRoot;
}
