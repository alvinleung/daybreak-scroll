import { spring } from "popmotion";
import { createTimer } from "./util";

interface SpringConfig {
  initial?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  onUpdate?: (value: number) => void;
}
function createSpringValue({
  initial = 0,
  stiffness = 1000,
  damping = 100,
  mass = 1,
}: SpringConfig) {
  let currentValue = initial;
  let velocity = 0;
  let currentAnimationFrame: number;

  function animateValue(
    targetValue: number,
    onUpdate?: (value: number) => void
  ) {
    // update the spring motion
    const springMotion = spring({
      from: currentValue,
      to: targetValue,
      velocity: velocity,
      restSpeed: 0.01,
      restDelta: 0.01,
      stiffness: stiffness,
      damping: damping,
      mass: mass,
    });

    const timer = createTimer();
    let prevSpringValue = springMotion.next(0).value;

    const updateSpringAnimation = () => {
      const elapsedTime = timer.getCurrentTime();
      // iterate the spring value
      const springValue = springMotion.next(elapsedTime);
      velocity = springValue.value - prevSpringValue;
      currentValue = springValue.value;

      if (timer.getDelta() > 1000 / 60) {
        console.warn("drop frame");
      }

      onUpdate && onUpdate(currentValue);

      if (!springValue.done) {
        currentAnimationFrame = requestAnimationFrame(updateSpringAnimation);
      }
    };

    if (currentAnimationFrame) cancelAnimationFrame(currentAnimationFrame);
    currentAnimationFrame = requestAnimationFrame(updateSpringAnimation);
  }

  function setSpringValue(
    newValue: number,
    onUpdate?: (value: number) => void
  ) {
    animateValue(newValue, onUpdate);
  }
  return { set: setSpringValue };
}
