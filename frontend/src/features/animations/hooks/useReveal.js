import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * @description React Hook for scroll-triggered element reveal.
 * @param {*} ref - ref to the element to be animated
 * @param {*} param1 - options for the animation
*/

export default function useReveal(
      ref,  //REFERENCE OF DIV TO ANIMATE
      {
            delay = 0,    //DELAY BEFORE ANIMATION STARTS
            duration = 1,  //DURATION OF ANIMATION
            yfrom = 40,     //FROM Y-AXIS
            yto = 0,      //TO Y-AXIS
            opacity = 0,   //INITIAL OPACITY
            ease = "power3.out",  //EASE FUNCTION
            once = true,     //ANIMATION PLAYS ONLY ONCE
            start = "top 85%", //START POSITION OF ANIMATION
      } = {}
) {

      useLayoutEffect(() => {

            if (!ref.current) return;

            const ctx = gsap.context(() => {

                  gsap.set(ref.current, {
                        opacity,
                        y: yfrom,
                        willChange: "transform, opacity",
                  });

                  gsap.to(ref.current, {
                        opacity: 1,
                        y: yto,
                        duration,
                        delay,
                        ease,

                        scrollTrigger: {
                              trigger: ref.current,
                              start,
                              once,
                        },
                  });

            }, ref);

            return () => ctx.revert();

      }, [
            ref,
            delay,
            duration,
            yfrom,
            yto,
            opacity,
            ease,
            once,
            start,
      ]);

}