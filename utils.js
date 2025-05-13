import { rayCastShoot } from "./shooting.js";

const shootingCooldown = 250;

function throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

const throttledRayCastShoot = throttle((scene, camera) => {
    rayCastShoot(scene, camera);
}, shootingCooldown);

export { throttle, throttledRayCastShoot };