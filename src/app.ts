import { createScroll } from "./scroll/scroll";

const scroll = createScroll();

//@ts-ignore expose scroll api
window.daybreak = window.daybreak || {};
//@ts-ignore expose scroll api
window.daybreak.scroll = scroll;


document.addEventListener("DOMContentLoaded ", () => {
  //@ts-ignore
  const router = window.daybreak.router;

  console.log("DOM content loaded, setting up scroll")

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
