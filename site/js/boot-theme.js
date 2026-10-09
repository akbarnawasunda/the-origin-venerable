(function () {
  try {
    var t = localStorage.getItem("tov:theme");
    if (t) document.documentElement.setAttribute("data-theme", t);
    var s = localStorage.getItem("tov:size");
    if (s) document.documentElement.style.setProperty("--reader-size", s);
  } catch (e) {}
})();
