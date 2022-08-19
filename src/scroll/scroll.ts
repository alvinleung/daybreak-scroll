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
  const currentScroll = state(0);
  const isTouchInput = state(false);
  const scrollContainer = state<HTMLDivElement>(document.createElement("div"));
  const scrollContent = state<HTMLDivElement>(document.createElement("div"));

  const scrollBarFactory = createScrollbarFactory();
  const scrollBarElms = state({
    scrollBar: scrollBarFactory.getScrollBar(),
    scrollBarConatiner: scrollBarFactory.getScrollBarContainer(),
  });

  let useSmoothMotion = true;

  const isScrollBarHidden = state(false);
  const viewportHeight = state(window.innerHeight);
  const documentHeight = state(0);
  const hideScrollbar = debounce(() => isScrollBarHidden.set(true), 500);

  const captureHeight = () => {
    viewportHeight.set(scrollContainer.value.clientHeight);
    documentHeight.set(scrollContent.value.scrollHeight);
  };

  const handleWheel = (e: WheelEvent) => {
    // handle scroll
    targetScroll.set(targetScroll.value + e.deltaY);
  };
  const handleResize = () => captureHeight();

  const handleMobileScroll = (e: Event) => {
    if (!isTouchInput.value) return;
    currentScroll.set(scrollContainer.value.scrollTop);
  }

  const handleTouchStart = (e: TouchEvent) => {
    isTouchInput.set(true);
    hideScrollbar();
  }

  isTouchInput.onChange((isTouchInput) => {
    if (!isTouchInput) return;
    // remove mobile state
    setupScrollDOM(scrollContainer.value, scrollContent.value, isTouchInput);
  })


  const addScrollListeners = (newScrollContainer: HTMLDivElement) => {
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("touchstart", handleTouchStart);
    newScrollContainer.addEventListener("scroll", handleMobileScroll);
    window.addEventListener("resize", handleResize);
  };

  const cleanupScrollListeners = (oldScrollContainer: HTMLDivElement) => {
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    oldScrollContainer.addEventListener("scroll", handleMobileScroll);
    window.removeEventListener("resize", handleResize);
  };

  // re-init everything when the scroll container change
  scrollContainer.onChange((newScrollElement, prevScrollElement) => {
    cleanupScrollListeners(prevScrollElement);
    addScrollListeners(newScrollElement);

    // setup scroll here
    scrollContent.set(newScrollElement.children[0] as HTMLDivElement);
    setupScrollDOM(scrollContainer.value, scrollContent.value, isTouchInput.value);
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

    // reset scroll
    useSmoothMotion = false;
    targetScroll.set(0);

    // for image loading
    // when new image loaded, it might affact the scroll height
    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("load", () => {
        captureHeight();
      })
    })
  });

  targetScroll.onChange(() => {
    isScrollBarHidden.set(false);
    hideScrollbar();
  });

  createStateRenderer(() => {

    // only smooth scroll for desktop
    if (isTouchInput.value) return;

    // calculate the scroll position
    const scrollPosition = (() => {
      const MIN_VALUE = 0;
      const MAX_VALUE = documentHeight.value - viewportHeight.value;

      if (targetScroll.value < MIN_VALUE) {
        targetScroll.set(MIN_VALUE);
        return MIN_VALUE;
      }

      if (targetScroll.value > MAX_VALUE) {
        targetScroll.set(MAX_VALUE);
        return MAX_VALUE;
      }

      return targetScroll.value;
    })();

    updateScrollbarDOM({
      scrollBar: scrollBarElms.value.scrollBar,
      scrollContent: scrollContent.value,
      hidden: isScrollBarHidden.value,
      documentHeight: documentHeight.value,
      viewportHeight: viewportHeight.value,
      scrollPosition,
      currentScroll,
      smooth: useSmoothMotion,
    });
    useSmoothMotion = true;
  }, [
    scrollBarElms,
    scrollContent,
    scrollContainer,
    targetScroll,
    isScrollBarHidden,
    viewportHeight,
    documentHeight,
  ]);

  const scrollTo = targetScroll.set;
  const setScrollContainer = scrollContainer.set;

  const cleanupScroll = () => {
    cleanupScrollListeners(scrollContainer.value);
  };

  const observeScroll = currentScroll.onChange;
  const unobserveScroll = currentScroll.unobserveChange;

  const recalculatePageHeight = captureHeight;

  const isInViewport = (elm: HTMLElement) => {
    const bounds = elm.getBoundingClientRect();

    return (
      bounds.bottom >= 0 &&
      bounds.top <= (viewportHeight.value)
    );
  }

  return {
    cleanupScroll,
    scrollTo,
    setScrollContainer,
    recalculatePageHeight,
    observeScroll,
    unobserveScroll,
    isInViewport
  };
};
