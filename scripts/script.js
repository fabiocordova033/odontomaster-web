const slides = document.querySelectorAll('.slide');

if (slides.length > 0) {

    const next = document.querySelector('.next');
    const prev = document.querySelector('.prev');

    let index = 0;

    const hero = document.querySelector('.hero');

    function showSlide(i) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[i].classList.add('active');
        // Foto actual como fondo difuminado del hero en celular (ver styles.css)
        if (hero) hero.style.setProperty('--slide-actual', `url("${slides[i].src}")`);
    }

    showSlide(0);

    next.addEventListener('click', () => {
        index = (index + 1) % slides.length;
        showSlide(index);
    });

    prev.addEventListener('click', () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
    });

    setInterval(() => {
        index = (index + 1) % slides.length;
        showSlide(index);
    }, 4000);
}


// El menú hamburguesa ahora está en scripts/menu.js (compartido por todas las páginas)



// TESTIMONIOS: carrusel deslizable (solo en el inicio). Se desliza con el dedo, con las flechas o
// con los puntos, y avanza solo cada 6 s. El avance automático se detiene mientras la persona
// interactúa, si la pestaña no está visible o si tiene las animaciones desactivadas.
const carrusel = document.querySelector(".testimonios-carrusel");

if (carrusel) {
    const pista = carrusel.querySelector(".testimonios-pista");
    const contenedorPuntos = document.querySelector(".testimonios-puntos");
    const sinAnimaciones = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tarjetas = () => [...pista.querySelectorAll(".testimonio:not([hidden])")];

    // Distancia de una tarjeta a la siguiente
    const paso = () => {
        const t = tarjetas();
        return t.length > 1 ? t[1].offsetLeft - t[0].offsetLeft : pista.clientWidth;
    };
    const maximo = () => pista.scrollWidth - pista.clientWidth;
    const posiciones = () => Math.max(1, Math.round(maximo() / paso()) + 1);
    const actual = () => Math.min(posiciones() - 1, Math.round(pista.scrollLeft / paso()));
    const ir = (i) => pista.scrollTo({ left: Math.min(i * paso(), maximo()), behavior: sinAnimaciones ? "auto" : "smooth" });

    // Al llegar al final vuelve al inicio (y al revés)
    const mover = (dir) => {
        const total = posiciones();
        ir((actual() + dir + total) % total);
    };

    carrusel.querySelector(".testimonios-anterior").addEventListener("click", () => mover(-1));
    carrusel.querySelector(".testimonios-siguiente").addEventListener("click", () => mover(1));

    // Puntos: uno por cada posición posible
    function armarPuntos() {
        const total = posiciones();
        carrusel.classList.toggle("sin-desplazar", maximo() < 5);
        contenedorPuntos.hidden = total < 2;
        contenedorPuntos.replaceChildren(...Array.from({ length: total }, (_, i) => {
            const punto = document.createElement("button");
            punto.type = "button";
            punto.tabIndex = -1; // con teclado se usan las flechas
            punto.addEventListener("click", () => ir(i));
            return punto;
        }));
        marcarPunto();
    }
    function marcarPunto() {
        const i = actual();
        [...contenedorPuntos.children].forEach((p, j) => p.classList.toggle("activo", i === j));
    }
    pista.addEventListener("scroll", () => requestAnimationFrame(marcarPunto), { passive: true });
    window.addEventListener("resize", armarPuntos);
    window.addEventListener("load", armarPuntos); // con la tipografía y las imágenes ya cargadas
    armarPuntos();

    // Teclado: flechas izquierda/derecha cuando la pista tiene el foco
    pista.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); mover(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); mover(-1); }
    });

    // Avance automático
    let pausado = false;
    const pausar = () => { pausado = true; };
    const seguir = () => { pausado = false; };
    carrusel.addEventListener("mouseenter", pausar);
    carrusel.addEventListener("mouseleave", seguir);
    carrusel.addEventListener("focusin", pausar);
    carrusel.addEventListener("focusout", seguir);
    // En celular, tras tocar o deslizar, espera un rato antes de seguir solo
    let reanudar;
    pista.addEventListener("touchstart", () => { pausar(); clearTimeout(reanudar); }, { passive: true });
    pista.addEventListener("touchend", () => { clearTimeout(reanudar); reanudar = setTimeout(seguir, 8000); }, { passive: true });

    if (!sinAnimaciones) {
        setInterval(() => {
            if (!pausado && !document.hidden && posiciones() > 1) mover(1);
        }, 6000);
    }
}

const input = document.querySelector("#telefono");

// Si la librería del teléfono no carga (CDN caído o bloqueado), el campo queda como uno normal
// y el resto de la página sigue funcionando
if (input && typeof window.intlTelInput === "function") window.intlTelInput(input, {

        initialCountry: "pe",

        preferredCountries: ["pe", "mx", "co", "us"],

        separateDialCode: true,

    });




// ✅ Inicializa EmailJS

(function() {
    if (window.emailjs) emailjs.init({
        publicKey: "gG5IGnoQ3-VQm8HTM",
        // 🛡️ Rechaza los envíos de navegadores controlados por programas (bots)
        blockHeadless: true,
        // 🛡️ Máximo un intento de envío cada 30 segundos, contando todas las páginas de la web
        limitRate: { id: "odm-formulario", throttle: 30000 },
        // Dónde guarda EmailJS la hora del último intento. Hay que indicarlo: en la versión 4.4.1,
        // init() sin esta opción borra el almacenamiento por defecto y el límite no funciona.
        storageProvider: {
            get: (clave) => { try { return Promise.resolve(localStorage.getItem(clave)); } catch (e) { return Promise.resolve(null); } },
            set: (clave, valor) => { try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ } return Promise.resolve(); },
            remove: (clave) => { try { localStorage.removeItem(clave); } catch (e) { /* sin almacenamiento */ } return Promise.resolve(); },
        },
    });
})();

// Manejar envío del formulario
const contactForm = document.getElementById("contact-form");
const cargaPagina = Date.now(); // para detectar envíos de bots (demasiado rápidos)
const ESPERA_ENTRE_ENVIOS = 60 * 1000; // 1 minuto entre solicitudes desde el mismo navegador

function leerUltimoEnvio() {
    try { return Number(localStorage.getItem("odm-ultimo-envio")) || 0; } catch (e) { return 0; }
}
function guardarUltimoEnvio() {
    try { localStorage.setItem("odm-ultimo-envio", String(Date.now())); } catch (e) { /* sin almacenamiento: no pasa nada */ }
}

if (contactForm) contactForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Evita recargar la página

    const statusMsg = document.getElementById("form-status");
    const submitBtn = contactForm.querySelector(".btn-submit");

    function mostrar(texto, color) {
        if (statusMsg) {
            statusMsg.textContent = texto;
            statusMsg.style.color = color;
        } else {
            alert(texto);
        }
    }

    // 🛡️ Anti-spam 1: campo trampa invisible. Una persona no lo ve; un bot lo llena.
    // Se finge que se envió para no darle pistas al bot.
    const trampa = contactForm.querySelector('input[name="sitio_web"]');
    if (trampa && trampa.value.trim() !== "") {
        mostrar("✅ ¡Mensaje enviado! Te contactaremos pronto.", "green");
        contactForm.reset();
        return;
    }

    // 🛡️ Anti-spam 2: nadie completa el formulario en menos de 3 segundos
    if (Date.now() - cargaPagina < 3000) {
        mostrar("⏳ Espera un momento y vuelve a intentarlo.", "#b45309");
        return;
    }

    // 🛡️ Anti-spam 3: máximo una solicitud por minuto desde el mismo navegador
    const restante = ESPERA_ENTRE_ENVIOS - (Date.now() - leerUltimoEnvio());
    if (restante > 0) {
        mostrar(`⏳ Ya recibimos tu solicitud. Puedes enviar otra en ${Math.ceil(restante / 1000)} segundos.`, "#b45309");
        return;
    }

    // Obtener valores del formulario (sin espacios sobrantes)
    const formData = {
        nombre: document.getElementById("nombre").value.trim(),
        apellidos: document.getElementById("apellidos").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        email: document.getElementById("email").value.trim(),
        especialidad: document.getElementById("especialidad").value
    };

    // ✔️ Validación: especialidad elegida (el campo se maneja con selector.js)
    if (document.getElementById("especialidad").selectedIndex <= 0) {
        mostrar("⚠️ Elige la especialidad que te interesa.", "#b91c1c");
        const boton = contactForm.querySelector(".selector-boton");
        if (boton) boton.focus();
        return;
    }

    // ✔️ Validación: teléfono con al menos 6 dígitos
    if (formData.telefono.replace(/\D/g, "").length < 6) {
        mostrar("⚠️ Escribe un número de teléfono válido.", "#b91c1c");
        document.getElementById("telefono").focus();
        return;
    }

    // Mostrar estado de carga
    mostrar("⏳ Enviando mensaje...", "#0066cc");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    // Si EmailJS no cargó (CDN caído o bloqueado), se ofrece WhatsApp en vez de fallar en silencio
    if (!window.emailjs) {
        mostrar("❌ No se pudo enviar en este momento. Escríbenos por WhatsApp al +51 973 791 164.", "red");
        return;
    }

    // Enviar email
    emailjs.send("service_sst69v2", "template_s9ltvah", formData)
        .then(function() {
            // ✅ ÉXITO
            guardarUltimoEnvio();
            // Cuenta la solicitud en Google Analytics (solo si el visitante aceptó las cookies)
            if (window.odmEvento) window.odmEvento("generate_lead", { especialidad: formData.especialidad });
            mostrar("✅ ¡Mensaje enviado! Te contactaremos pronto.", "green");

            // Limpiar formulario
            contactForm.reset();

            // Restaurar botón
            setTimeout(function() {
                submitBtn.disabled = false;
                submitBtn.textContent = "Enviar";
                if (statusMsg) statusMsg.textContent = "";
            }, 3000);
        })
        .catch(function(error) {
            // ❌ ERROR
            console.error("❌ Error al enviar:", error);
            if (error && error.status === 429) {
                // Límite de EmailJS: otro intento de envío hace menos de 30 segundos
                mostrar("⏳ Espera unos segundos antes de volver a enviar.", "#b45309");
            } else if (error && error.status === 451) {
                // Navegador automático (bot) o sin idioma configurado
                mostrar("❌ No se pudo enviar desde este navegador. Escríbenos por WhatsApp al +51 973 791 164.", "red");
            } else {
                mostrar("❌ Error al enviar. Intenta de nuevo o escríbenos por WhatsApp.", "red");
            }

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar";
        });
});


// Botón "¿Cómo llegar?": abre Waze si el celular lo tiene; si no, Google Maps.
// - Android: Chrome abre Waze si está instalado y, si no, va solo a Google Maps (intent con respaldo).
// - iPhone: se intenta abrir Waze. Si la app se abre, la página pasa a segundo plano y no se hace nada más.
//   Si no está instalada (Safari muestra "no se puede abrir la página") o la persona cancela,
//   se va a Google Maps. Si en 2,5 s no pasa nada, también.
// - PC u otros: el enlace normal del botón (Google Maps en otra pestaña), sin JavaScript.
const esAndroid = /Android/i.test(navigator.userAgent);
const esIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPad con iPadOS

document.querySelectorAll(".btn-map[data-lat]").forEach((boton) => {
    boton.addEventListener("click", (e) => {
        if (!esAndroid && !esIPhone) return; // PC: abre Google Maps con el enlace del botón

        e.preventDefault();
        const destino = boton.dataset.lat + "," + boton.dataset.lng;
        const googleMaps = boton.href;

        if (esAndroid) {
            window.location.href = "intent://?ll=" + destino + "&navigate=yes" +
                "#Intent;scheme=waze;package=com.waze;S.browser_fallback_url=" +
                encodeURIComponent(googleMaps) + ";end";
            return;
        }

        // iPhone
        let terminado = false;
        let temporizador;
        const irAGoogleMaps = () => {
            if (terminado || document.hidden) return;
            terminado = true;
            limpiar();
            window.location.href = googleMaps;
        };
        const seAbrioWaze = () => {
            if (!document.hidden) return;
            terminado = true;
            limpiar();
        };
        const saleDeLaPagina = () => {
            terminado = true;
            limpiar();
        };
        // Safari muestra un aviso (abrir en Waze / no se puede abrir): mientras está en pantalla se espera;
        // al cerrarlo, si Waze no se abrió, se va a Google Maps
        const alMostrarAviso = () => clearTimeout(temporizador);
        const alCerrarAviso = () => setTimeout(irAGoogleMaps, 300);
        function limpiar() {
            clearTimeout(temporizador);
            document.removeEventListener("visibilitychange", seAbrioWaze);
            window.removeEventListener("pagehide", saleDeLaPagina);
            window.removeEventListener("blur", alMostrarAviso);
            window.removeEventListener("focus", alCerrarAviso);
        }
        document.addEventListener("visibilitychange", seAbrioWaze);
        window.addEventListener("pagehide", saleDeLaPagina);
        window.addEventListener("blur", alMostrarAviso);
        window.addEventListener("focus", alCerrarAviso);

        temporizador = setTimeout(irAGoogleMaps, 2500);
        window.location.href = "waze://?ll=" + destino + "&navigate=yes";
    });
});


// Botones que llevan a otra página o sección (antes onclick en el HTML)
document.querySelectorAll("button[data-href]").forEach((boton) => {
    boton.addEventListener("click", () => {
        window.location.href = boton.dataset.href;
    });
});



window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  // Espera un poquito y lo desvanece
  setTimeout(() => {
    preloader.classList.add("oculto");
  }, 500); // 0.5s extra para que se vea el logo
});


// FADE OUT AL NAVEGAR
document.addEventListener("DOMContentLoaded", function () {
  // Sin tel: ni mailto: abren el teléfono o el correo y la página sigue abierta: si se desvaneciera,
  // al volver el visitante vería la página en blanco
  const links = document.querySelectorAll("a[href]:not([href^='#']):not([target='_blank']):not([href^='tel:']):not([href^='mailto:'])");

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      const url = this.getAttribute("href");
      if (!url || url.startsWith("javascript:")) return;
      // Ctrl/Cmd + clic o clic con la rueda: abrir en otra pestaña, sin desvanecer esta
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;

      e.preventDefault();
      document.body.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = url;
      }, 400); // mismo tiempo que la transición del body
    });
  });
});

// Al volver con el botón "Atrás", el navegador puede restaurar la página tal como quedó (desvanecida)
window.addEventListener("pageshow", function (e) {
  if (e.persisted) document.body.classList.remove("fade-out");
});

