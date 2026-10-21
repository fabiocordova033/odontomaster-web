// ================== MENÚ HAMBURGUESA (compartido por todas las páginas) ==================
// En celular y tablet el ☰ abre un panel lateral que entra desde la izquierda, con las
// páginas principales y los tratamientos agrupados por categoría. Los estilos están en css/menu.css
// El panel se arma aquí para no repetir el HTML en las 18 páginas.

(function () {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-menu");
  if (!toggle || !nav) return;

  // Tratamientos del menú: la categoría es solo un título (sin enlace)
  const TRATAMIENTOS = [
    { categoria: "Estética dental", items: [
      ["Blanqueamiento Dental", "/pages/blanqueamiento-dental.html"],
      ["Carillas Dentales", "/pages/carrillas-dentales.html"],
    ] },
    { categoria: "Ortodoncia", items: [
      ["Ortodoncia", "/pages/ortodoncia.html"],
      ["Ortodoncia Invisible", "/pages/ortodoncia-invisible.html"],
    ] },
    { categoria: "Rehabilitación oral", items: [
      ["Implantología", "/pages/implantologia.html"],
      ["Prótesis Bucales", "/pages/protesis-bucales.html"],
    ] },
    { categoria: "Especialidades", items: [
      ["Endodoncia", "/pages/endodoncia.html"],
      ["Periodoncia", "/pages/periodoncia.html"],
      ["Cirugía Maxilofacial", "/pages/cirugia-maxilofacial.html"],
      ["Odontopediatría", "/pages/odontopediatria.html"],
    ] },
  ];

  function crear(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto) el.textContent = texto;
    return el;
  }

  // ---------- Panel ----------
  const fondo = crear("div", "menu-fondo");
  const panel = crear("aside", "menu-panel");
  panel.id = "menu-panel";
  panel.setAttribute("aria-label", "Menú");
  panel.setAttribute("aria-hidden", "true");

  const cerrar = crear("button", "menu-cerrar", "✕");
  cerrar.type = "button";
  cerrar.setAttribute("aria-label", "Cerrar menú");
  panel.appendChild(cerrar);

  const paginaActual = location.pathname.replace(/\/$/, "/index.html");
  function enlace(texto, href, clase) {
    const a = crear("a", clase, texto);
    a.href = href;
    if (new URL(href, location.href).pathname === paginaActual && !href.includes("#")) {
      a.setAttribute("aria-current", "page");
    }
    return a;
  }

  // Páginas principales: se copian del menú de cada página (así "Contacto" lleva al formulario de esa página)
  const principales = crear("nav", "menu-principal");
  principales.setAttribute("aria-label", "Páginas");
  nav.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href") === "#" ? "/index.html" : a.getAttribute("href");
    principales.appendChild(enlace(a.textContent.trim(), href, "menu-titulo"));
  });
  panel.appendChild(principales);

  // Tratamientos por categoría
  const seccion = crear("nav", "menu-tratamientos");
  seccion.setAttribute("aria-label", "Tratamientos");
  seccion.appendChild(crear("p", "menu-titulo menu-titulo-seccion", "Tratamientos"));
  TRATAMIENTOS.forEach((grupo) => {
    seccion.appendChild(crear("p", "menu-categoria", grupo.categoria));
    grupo.items.forEach(([texto, href]) => seccion.appendChild(enlace(texto, href, "menu-item")));
  });
  panel.appendChild(seccion);

  document.body.append(fondo, panel);

  // ---------- Abrir y cerrar ----------
  // Accesibilidad: que el ☰ se pueda usar con teclado y lectores de pantalla
  toggle.setAttribute("role", "button");
  toggle.setAttribute("tabindex", "0");
  toggle.setAttribute("aria-label", "Abrir menú");
  toggle.setAttribute("aria-controls", "menu-panel");
  toggle.setAttribute("aria-expanded", "false");

  function setOpen(open) {
    if (open === panel.classList.contains("abierto")) return;
    panel.classList.toggle("abierto", open);
    fondo.classList.toggle("visible", open);
    document.documentElement.classList.toggle("menu-abierto", open); // evita que la página se mueva detrás
    panel.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    if (open) cerrar.focus({ preventScroll: true });
    else if (panel.contains(document.activeElement)) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener("click", () => setOpen(true));
  toggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  });

  // Cerrar con la ✕, al tocar fuera del panel, al elegir una opción o con la tecla Esc
  cerrar.addEventListener("click", () => setOpen(false));
  fondo.addEventListener("click", () => setOpen(false));
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Si se agranda la ventana a tamaño PC (o se gira la tablet), el panel se cierra
  window.matchMedia("(min-width: 1025px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();
