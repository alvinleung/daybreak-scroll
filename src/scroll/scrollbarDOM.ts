import { createTimer, State, stylesheet } from "./util";
import { spring } from "popmotion";

export const setupScrollDOM = (
  scrollContainer: HTMLDivElement,
  scrollContent: HTMLDivElement
) => {
  scrollContainer.style.overflowY = "hidden";
  scrollContainer.style.overflowAnchor = "none";
  scrollContainer.style.width = "100vw";
  scrollContainer.style.height = "100vh";

  // to cancel all the margin collapsing
  scrollContainer.style.display = "flex";

  scrollContent.style.width = "100%";

  // prevent browser scroll preservation
  document.body.style.overflowAnchor = "none";

  // for smooth body scroll
  scrollContainer.scrollTo(0, 0);
};

interface ScrollBarDOMFactory {
  getScrollBarContainer: () => HTMLDivElement;
  getScrollBar: () => HTMLDivElement;
}
export const createScrollbarFactory = (): ScrollBarDOMFactory => {
  function getScrollBar() {
    const scrollBar = document.createElement("div");
    stylesheet(scrollBar, {
      transitionProperty: "transform, height, opacity",
      transitionDuration: "0.2s",
      height: "100%",
      width: "4px",
      backgroundColor: "rgba(0,0,0,.75)",
      willChange: "transform, height",
    });
    return scrollBar;
  }

  function getScrollBarContainer() {
    const scrollBarContainer = document.createElement("div");
    scrollBarContainer.setAttribute("persist-id", "scrollbar");
    stylesheet(scrollBarContainer, {
      position: "fixed",
      right: "0px",
      top: "0px",
      bottom: "0px",
      paddingTop: "0px",
      paddingBottom: "4px",
      paddingRight: "0px",
      width: "4px",
      zIndex: "100000000",
    });

    return scrollBarContainer;
  }

  return {
    getScrollBarContainer,
    getScrollBar,
  };
};

interface ScrollBarDOMInterface {
  scrollBar: HTMLDivElement;
  scrollContent: HTMLDivElement;
  hidden: boolean;
  smooth: boolean;
  scrollPosition: number;
  documentHeight: number;
  viewportHeight: number;
  currentScroll: State<number>;
}

const scrollMotion = createSmoothMotion({ initial: 0, smoothFactor: 0.05 });

export const updateScrollbarDOM = ({
  scrollContent,
  scrollBar,
  hidden,
  documentHeight,
  viewportHeight,
  scrollPosition,
  currentScroll,
  smooth,
}: ScrollBarDOMInterface) => {
  const scrollableLength = documentHeight - viewportHeight;
  const scrollbarHeight = viewportHeight / documentHeight;
  const targetScrollProgress = scrollPosition / scrollableLength;

  stylesheet(scrollBar, {
    transformOrigin: "top left",
    y: `${targetScrollProgress * (1 - scrollbarHeight) * 100}%`,
    height: "100%",
    scaleY: scrollbarHeight,
    opacity: hidden ? "0" : "1",
  });

  scrollMotion.setValue(
    scrollPosition,
    (scrollPosition) => {
      stylesheet(scrollContent, {
        y: -scrollPosition + "px",
      });
      currentScroll.set(scrollPosition);
    },
    smooth
  );
};

function createSmoothMotion({ initial = 0, smoothFactor = 0.05 }) {
  let currentAnimationFrame = 0;
  let currentScroll = initial;
  let targetScroll = initial;
  let velocity = 0;

  function updateScrollMotion(
    target: number,
    updateFunction: (newValue: number) => void,
    smooth: boolean = true
  ) {
    targetScroll = target;

    if (!smooth) {
      currentScroll = targetScroll;
      updateFunction(currentScroll);
      return;
    }

    function updateFrame() {
      // interpolate here
      velocity = (targetScroll - currentScroll) * smoothFactor;
      currentScroll += velocity;

      updateFunction(currentScroll);

      const velocityAbs = Math.abs(velocity);
      const isDone = velocityAbs < 0.1;

      if (!isDone) requestAnimationFrame(updateFrame);
    }

    if (currentAnimationFrame) cancelAnimationFrame(currentAnimationFrame);
    currentAnimationFrame = requestAnimationFrame(updateFrame);
  }

  return { setValue: updateScrollMotion };
}
