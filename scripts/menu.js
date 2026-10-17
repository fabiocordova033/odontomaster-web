// ================== MENÚ HAMBURGUESA (compartido por todas las páginas) ==================
// Abre y cierra el menú del navbar en celular y tablet. Los estilos están en css/menu.css

(function () {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-menu");
  if (!toggle || !nav) return;

  // Accesibilidad: que el ☰ se pueda usar con teclado y lectores de pantalla
  toggle.setAttribute("role", "button");
  toggle.setAttribute("tabindex", "0");
  toggle.setAttribute("aria-label", "Abrir menú");
  toggle.setAttribute("aria-controls", "nav-menu");
  toggle.setAttribute("aria-expanded", "false");

  function setOpen(open) {
    nav.classList.toggle("active", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    toggle.textContent = open ? "✕" : "☰";
  }

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("active")));

  toggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(!nav.classList.contains("active"));
    }
  });

  // Cerrar al elegir una opción, al tocar fuera del menú o con la tecla Esc
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
})();
