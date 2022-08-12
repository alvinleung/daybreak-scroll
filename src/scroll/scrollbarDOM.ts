import { createTimer, stylesheet } from "./util";
import { spring } from "popmotion";

export const setupScrollDOM = () => {
  requestAnimationFrame(() => {
    document.body.style.overflowY = "hidden";
    // prevent browser scroll preservation
    document.body.style.overflowAnchor = "none";

    // for smooth body scroll
    // document.body.style.transitionProperty = "transform";
    // document.body.style.transitionDuration = ".1s";
    window.scrollTo(0, 0);
  });
};

interface ScrollBarDOM {
  scrollBarContainer: HTMLDivElement;
  scrollBar: HTMLDivElement;
  removeScrollBarDOM: () => void;
}
export const createScrollbarDOM = (): ScrollBarDOM => {
  const scrollBarContainer = document.createElement("div");
  scrollBarContainer.setAttribute("persist-id", "scrollbar");
  stylesheet(scrollBarContainer, {
    position: "fixed",
    right: "0px",
    top: "0px",
    bottom: "0px",
    padding: "1",
  });

  const scrollBar = document.createElement("div");
  stylesheet(scrollBar, {
    // transitionProperty: "transform, height",
    // transitionDuration: "0.1s",
    width: "8px",
    height: "5px",
    backgroundColor: "#000",
    willChange: "transform, height",
  });

  scrollBarContainer.appendChild(scrollBar);
  document.documentElement.appendChild(scrollBarContainer);

  const removeScrollBarDOM = () => {
    document.documentElement.removeChild(scrollBarContainer);
  };

  return {
    scrollBarContainer,
    scrollBar,
    removeScrollBarDOM,
  };
};

interface ScrollBarDOMInterface {
  elms: ScrollBarDOM;
  scrollPosition: number;
  documentHeight: number;
  viewportHeight: number;
}

const scrollMotion = createSmoothMotion({ initial: 0, smoothFactor: 0.05 });

export const updateScrollbarDOM = ({
  elms,
  documentHeight,
  viewportHeight,
  scrollPosition,
}: ScrollBarDOMInterface) => {
  const scrollableLength = documentHeight - viewportHeight;
  const targetScrollProgress = scrollPosition / scrollableLength;

  scrollMotion.setValue(scrollPosition, (scrollPosition) => {
    stylesheet(elms.scrollBar, {
      transformOrigin: "top left",
      y: `${scrollPosition}px`,
    });
    stylesheet(document.body, {
      y: -scrollPosition + "px",
    });
  });
};

function createSmoothMotion({ initial = 0, smoothFactor = 0.05 }) {
  let currentAnimationFrame = 0;
  let currentScroll = initial;
  let targetScroll = initial;
  let velocity = 0;

  function updateScrollMotion(
    target: number,
    updateFunction: (newValue: number) => void
  ) {
    targetScroll = target;

    function updateFrame(f) {
      // interpolate here
      velocity = (targetScroll - currentScroll) * smoothFactor;
      currentScroll += velocity;

      updateFunction(currentScroll);

      const velocityAbs = Math.abs(velocity);
      const isDone = velocityAbs < 0.1;
      console.log(currentScroll);

      if (!isDone) requestAnimationFrame(updateFrame);
    }

    if (currentAnimationFrame) cancelAnimationFrame(currentAnimationFrame);
    currentAnimationFrame = requestAnimationFrame(updateFrame);
  }

  return { setValue: updateScrollMotion };
}
