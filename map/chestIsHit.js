export function chestDeath(hitBox) {
    if (hitBox.isHit) {
        const chest = hitBox.parent;
        if (!chest.isOpen) {
            chest.isOpen = true;
            console.log("Treasure chest was opened!");
            alert("You Won!");
        }
        hitBox.isHit = false;
    }
}
