// ================== PRELOADER (páginas que no cargan script.js) ==================
// Igual que en script.js: cuando la página termina de cargar, espera 0.5s y lo desvanece.
// Los estilos de #preloader y .oculto están en el CSS de cada página.

(function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  function ocultar() {
    setTimeout(() => preloader.classList.add("oculto"), 500); // 0.5s para que se vea el logo
  }

  if (document.readyState === "complete") {
    ocultar();
  } else {
    window.addEventListener("load", ocultar);
  }

  // Por seguridad: si algo tarda demasiado en cargar, se oculta igual a los 4 segundos
  setTimeout(() => preloader.classList.add("oculto"), 4000);
})();
