import { createTreasureChestModel } from "../models/treasureChest/TreasureChestModel.js";
import { chestDeath } from "./chestIsHit.js";

export function treasureChest(scene, x, y, z) {
  const chest = createTreasureChestModel(scene);
  chest.position = new BABYLON.Vector3(x, y, z);

  // Create hitbox for ray detection
  const hitBox = BABYLON.MeshBuilder.CreateBox("chestHitbox", {
    width: 1.2,
    height: 1.21,
    depth: 0.93,
  }, scene);
  hitBox.position = new BABYLON.Vector3(0, 0.4, -0.01);
  hitBox.isVisible = false;
  hitBox.parent = chest;
  hitBox.isPickable = true;

  // Setup properties needed for ray hit detection
  chest.hitBox = hitBox;
  hitBox.isHit = false;
  hitBox.isTreasureChest = true;

  chest.physicsBody = new BABYLON.PhysicsAggregate(
    hitBox,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 0, restitution: 0.2, friction: 1 },
    scene,
  );

  // Add hit detection method that opens the chest
  hitBox.onHit = function() {
    if (!hitBox.isHit && !chest.isOpen) {
      hitBox.isHit = true;
      chest.isOpen = true;
      console.log("Treasure chest was hit!");
      chest.openLid();
      setTimeout(() => {
        hitBox.isHit = false;
      }, 100);
    }
  };

  scene.onBeforeRenderObservable.add(() => {
    if (!chest.isOpen) {
      chestDeath(hitBox);
    }
  });

  return chest;
}