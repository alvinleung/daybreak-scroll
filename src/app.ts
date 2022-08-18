import { createScroll } from "./scroll/scroll";

const scroll = createScroll();

//@ts-ignore expose scroll api
window.daybreak = window.daybreak || {};
//@ts-ignore expose scroll api
window.daybreak.scroll = scroll;


console.log("scroll module loading")

const initScroll = () => {
  //@ts-ignore
  const router = window.daybreak.router;

  console.log("DOM content loaded, setting up scroll")

  function refreshScrollContainer() {
    console.log("changing scroll container ")

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
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initScroll);
  console.log("loaded before document ready, adding event listener")
} else {
  console.log("executing right away");
  initScroll();
}
