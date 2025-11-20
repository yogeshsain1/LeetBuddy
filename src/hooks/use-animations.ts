import { useEffect, useRef } from 'react';
import { animate, stagger, utils } from 'animejs';

export function useCountUp(
  end: number,
  duration: number = 2000,
  delay: number = 0
) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const obj = { value: 0 };
    
    animate(obj, {
      value: end,
      duration,
      delay,
      easing: "out(3)",
      round: 1,
      update: function () {
        if (elementRef.current) {
          elementRef.current.textContent = obj.value.toString();
        }
      },
    });
  }, [end, duration, delay]);

  return elementRef;
}

export function useStaggerReveal(selector: string, delay: number = 100) {
  useEffect(() => {
    animate(selector, {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(delay),
      duration: 800,
      easing: "out(3)",
    });
  }, [selector, delay]);
}

export function useSpringAnimation(
  elementRef: React.RefObject<HTMLElement>,
  trigger: boolean
) {
  useEffect(() => {
    if (!elementRef.current || !trigger) return;

    animate(elementRef.current, {
      scale: [0.5, 1],
      opacity: [0, 1],
      duration: 800,
      easing: "spring(1, 80, 10, 0)",
    });
  }, [elementRef, trigger]);
}
