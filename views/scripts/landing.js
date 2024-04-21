window.onload = () => {
  document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");
}
window.onbeforeunload = () => {
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");
}
window.onloadstart = () => {
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");
}

const navId = document.getElementById("nav_menu"),
  ToggleBtnId = document.getElementById("toggle_btn"),
  CloseBtnId = document.getElementById("close_btn");
// ==== SHOW MENU ==== //
ToggleBtnId.addEventListener("click", () => {
  navId.classList.add("show");
});
// ==== HIDE MENU ==== //
CloseBtnId.addEventListener("click", () => {
  navId.classList.remove("show");
});

AOS.init();
