import { createScroll } from "./scroll/scroll";

const scroll = createScroll();

//@ts-ignore expose scroll api
window.daybreakScroll = scroll;

window.addEventListener("load", () => {
  //@ts-ignore
  const router = window.router;

  function refreshScrollContainer() {
    const scrollContainer = document.querySelector(
      ".scroll-container"
    ) as HTMLDivElement;

    if (scrollContainer) {
      scroll.setScrollContainer(scrollContainer);
      return;
    }
    scroll.cleanupScroll();
  }

  router.observePageLoad(() => refreshScrollContainer());
  refreshScrollContainer();
});
