import {
  createScrollbarFactory,
  setupScrollDOM,
  updateScrollbarDOM,
} from "./scrollbarDOM";
import {
  createStateRenderer,
  debounce,
  State,
  state,
  stylesheet,
} from "./util";

export const createScroll = () => {
  const targetScroll = state(0);
  const scrollContainer = state<HTMLDivElement>(document.createElement("div"));
  const scrollContent = state<HTMLDivElement>(document.createElement("div"));

  const scrollBarFactory = createScrollbarFactory();
  const scrollBarElms = state({
    scrollBar: scrollBarFactory.getScrollBar(),
    scrollBarConatiner: scrollBarFactory.getScrollBarContainer(),
  });

  const scrollBarHidden = state(false);
  const viewportHeight = state(window.innerHeight);
  const documentHeight = state(window.innerHeight);
  const hideScrollbar = debounce(() => scrollBarHidden.set(false), 500);

  const handleScroll = (e: WheelEvent) => {
    // handle scroll
    targetScroll.set(targetScroll.value + e.deltaY);
  };
  const handleResize = () => captureHeight();

  const addScrollListeners = () => {
    window.addEventListener("wheel", handleScroll);
    window.addEventListener("resize", handleResize);
  };

  const cleanupScrollListeners = () => {
    window.removeEventListener("wheel", handleScroll);
    window.removeEventListener("resize", handleResize);
  };

  const captureHeight = () => {
    viewportHeight.set(scrollContainer.value.clientHeight);
    documentHeight.set(scrollContent.value.scrollHeight);
  };

  // re-init everything when the scroll container change
  scrollContainer.onChange((newScrollElement, prevScrollElement) => {
    cleanupScrollListeners();
    addScrollListeners();

    // setup scroll here
    scrollContent.set(newScrollElement.children[0] as HTMLDivElement);
    setupScrollDOM(scrollContainer.value, scrollContent.value);
    captureHeight();

    // remove old scrollbar and add it to the new
    const scrollBarContainer = scrollBarElms.value.scrollBarConatiner;
    const scrollBar = scrollBarElms.value.scrollBar;
    if (scrollBarContainer.parentElement === prevScrollElement) {
      prevScrollElement.removeChild(scrollBarContainer);
      scrollBarContainer.removeChild(scrollBar);
    }

    scrollBarContainer.appendChild(scrollBar);
    newScrollElement.appendChild(scrollBarContainer);
  });

  createStateRenderer(() => {
    // calculate the scroll position
    const scrollPosition = (() => {
      const MIN_VALUE = 0;
      const MAX_VALUE = documentHeight.value - viewportHeight.value;

      const isScrollingUp = targetScroll.value < targetScroll.prevValue;

      if (targetScroll.value < MIN_VALUE && isScrollingUp) {
        targetScroll.set(MIN_VALUE);
        return MIN_VALUE;
      }

      // console.log(MAX_VALUE);

      if (targetScroll.value > MAX_VALUE && !isScrollingUp) {
        targetScroll.set(MAX_VALUE);
        return MAX_VALUE;
      }

      return targetScroll.value;
    })();

    updateScrollbarDOM({
      scrollBar: scrollBarElms.value.scrollBar,
      scrollContent: scrollContent.value,
      hidden: scrollBarHidden.value,
      documentHeight: documentHeight.value,
      viewportHeight: viewportHeight.value,
      scrollPosition,
    });

    hideScrollbar();
  }, [
    scrollBarElms,
    scrollContent,
    scrollContainer,
    targetScroll,
    scrollBarHidden,
    viewportHeight,
    documentHeight,
  ]);

  const scrollTo = targetScroll.set;
  const setScrollContainer = scrollContainer.set;

  const cleanupScroll = () => {
    cleanupScrollListeners();
  };

  return { cleanupScroll, scrollTo, setScrollContainer };
};
