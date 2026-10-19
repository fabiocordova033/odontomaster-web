// ================== SELECTOR DE ESPECIALIDADES (compartido) ==================
// Reemplaza visualmente el <select> del formulario de contacto por una lista propia que
// muestra 3 opciones y hace scroll para ver las demás, igual en PC, tablet y celular
// (la lista de un <select> normal la dibuja el sistema y en celular no se puede cambiar).
// El <select> original queda oculto y sigue guardando el valor, así script.js y EmailJS
// funcionan igual que antes. Estilos en css/selector.css

(function () {
  document.querySelectorAll(".contact-form select").forEach((select) => {
    const opciones = [...select.options];
    const placeholder = opciones[0]; // "Selecciona"

    // Contenedor, botón visible y lista
    const box = document.createElement("div");
    box.className = "selector";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "selector-boton";
    boton.setAttribute("aria-haspopup", "listbox");
    boton.setAttribute("aria-expanded", "false");

    const lista = document.createElement("ul");
    lista.className = "selector-lista";
    lista.setAttribute("role", "listbox");
    lista.id = select.id + "-lista";
    boton.setAttribute("aria-controls", lista.id);

    const items = opciones.slice(1).map((op) => {
      const li = document.createElement("li");
      li.className = "selector-opcion";
      li.setAttribute("role", "option");
      li.textContent = op.text;
      li.dataset.valor = op.value;
      lista.appendChild(li);
      return li;
    });

    select.classList.add("selector-oculto");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    select.after(box);
    box.append(boton, lista);

    // Si hay un <label> antes del select, que también nombre al botón
    const label = select.closest(".form-group")?.querySelector("label");
    if (label) {
      label.id = label.id || select.id + "-label";
      boton.setAttribute("aria-labelledby", label.id + " " + (boton.id = select.id + "-boton"));
      label.addEventListener("click", () => boton.focus());
    }

    let activo = -1; // opción resaltada con el teclado

    function pintar() {
      const elegido = select.selectedIndex > 0;
      boton.textContent = elegido ? select.options[select.selectedIndex].text : placeholder.text;
      boton.classList.toggle("selector-placeholder", !elegido);
      items.forEach((li, i) => li.setAttribute("aria-selected", String(i + 1 === select.selectedIndex)));
    }

    function resaltar(i) {
      activo = Math.max(0, Math.min(items.length - 1, i));
      items.forEach((li, n) => li.classList.toggle("selector-activa", n === activo));
      items[activo].scrollIntoView({ block: "nearest" });
    }

    function abrir() {
      box.classList.add("abierto");
      boton.setAttribute("aria-expanded", "true");
      const actual = select.selectedIndex - 1;
      resaltar(actual >= 0 ? actual : 0);
      // la opción elegida queda visible arriba de la lista
      lista.scrollTop = actual > 0 ? items[actual].offsetTop : 0;
    }

    function cerrar() {
      box.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
      items.forEach((li) => li.classList.remove("selector-activa"));
    }

    function elegir(i) {
      select.selectedIndex = i + 1;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      pintar();
      cerrar();
      boton.focus();
    }

    boton.addEventListener("click", () => (box.classList.contains("abierto") ? cerrar() : abrir()));

    items.forEach((li, i) => {
      li.addEventListener("click", () => elegir(i));
      li.addEventListener("mousemove", () => resaltar(i));
    });

    boton.addEventListener("keydown", (e) => {
      const abierta = box.classList.contains("abierto");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!abierta) return abrir();
        resaltar(activo + (e.key === "ArrowDown" ? 1 : -1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abierta && activo >= 0 ? elegir(activo) : abrir();
      } else if (e.key === "Escape" || e.key === "Tab") {
        cerrar();
      }
    });

    document.addEventListener("click", (e) => {
      if (!box.contains(e.target)) cerrar();
    });

    // Cuando script.js limpia el formulario después de enviarlo, volver a "Selecciona"
    select.form?.addEventListener("reset", () => setTimeout(pintar));

    pintar();
  });
})();
