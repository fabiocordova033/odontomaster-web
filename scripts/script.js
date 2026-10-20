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



const container = document.querySelector(".testimonial-cards");

// Solo el inicio tiene testimonios: en las demás páginas no se ejecuta
if (container) setInterval(() => {

    // mover primera tarjeta al final
    container.appendChild(container.firstElementChild);

    // quitar active a todas
    document.querySelectorAll(".testimonial").forEach(card => {
        card.classList.remove("active");
    });

    // poner active a la del centro
    const cards = document.querySelectorAll(".testimonial");

    if(cards[1]){
        cards[1].classList.add("active");
    }

}, 3000);

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
    if (window.emailjs) emailjs.init("gG5IGnoQ3-VQm8HTM");
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
        mostrar("❌ No se pudo enviar en este momento. Escríbenos por WhatsApp al +51 910 840 567.", "red");
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
            mostrar("❌ Error al enviar. Intenta de nuevo o escríbenos por WhatsApp.", "red");

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar";
        });
});


// Botón "¿Cómo llegar?": abre Waze en otra pestaña y, si en 2 segundos no se abrió
// (por ejemplo, sin la app), lleva a Google Maps. Antes estaba como onclick en el HTML.
document.querySelectorAll(".btn-map[data-respaldo]").forEach((boton) => {
    boton.addEventListener("click", () => {
        setTimeout(() => {
            window.location.href = boton.dataset.respaldo;
        }, 2000);
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
  const links = document.querySelectorAll("a[href]:not([href^='#']):not([target='_blank'])");

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      const url = this.getAttribute("href");
      if (!url || url.startsWith("javascript:")) return;

      e.preventDefault();
      document.body.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = url;
      }, 400); // mismo tiempo que la transición del body
    });
  });
});

