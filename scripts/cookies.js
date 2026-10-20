// ================== AVISO DE COOKIES + GOOGLE ANALYTICS ==================
// Google Analytics solo se carga si el visitante pulsa "Aceptar".
// Mientras no decida (o si rechaza) no se carga nada de Google Analytics ni se crean sus cookies.
// La decisión se guarda en el navegador (localStorage "odm-cookies") y se puede cambiar
// desde la Política de Cookies o con cualquier elemento que tenga data-cookies-config.

// 👉 Pega aquí el ID de medición de tu propiedad de Google Analytics 4 (empieza con "G-").
//    Mientras sea el de ejemplo, el aviso se muestra pero no se envía nada a Google.
const GA_ID = "G-XXXXXXXXXX";

const CLAVE_COOKIES = "odm-cookies";
const VIGENCIA_DECISION = 365 * 24 * 60 * 60 * 1000; // se vuelve a preguntar después de 1 año

function leerDecisionCookies() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_COOKIES));
        if (!guardado || Date.now() - guardado.fecha > VIGENCIA_DECISION) return null;
        return guardado.valor; // "aceptadas" o "rechazadas"
    } catch (e) {
        return null;
    }
}

function guardarDecisionCookies(valor) {
    try {
        localStorage.setItem(CLAVE_COOKIES, JSON.stringify({ valor: valor, fecha: Date.now() }));
    } catch (e) { /* sin almacenamiento: se volverá a preguntar en la próxima visita */ }
}

function idAnalyticsValido() {
    return /^G-[A-Z0-9]+$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";
}

// Carga Google Analytics (solo una vez)
function cargarAnalytics() {
    if (!idAnalyticsValido() || window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
}

// Si el visitante rechaza después de haber aceptado, se borran las cookies de Analytics
function borrarCookiesAnalytics() {
    const partes = location.hostname.split(".");
    const dominios = ["", location.hostname];
    if (partes.length > 1) dominios.push("." + partes.slice(-2).join("."));

    document.cookie.split(";").forEach((cookie) => {
        const nombre = cookie.split("=")[0].trim();
        if (nombre === "_ga" || nombre.startsWith("_ga_") || nombre === "_gid") {
            dominios.forEach((dominio) => {
                document.cookie = nombre + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" +
                    (dominio ? "; domain=" + dominio : "");
            });
        }
    });
}

// Envía un evento a Analytics solo si el visitante aceptó (lo usa script.js al enviar el formulario)
window.odmEvento = function (nombre, datos) {
    if (window.gtag && leerDecisionCookies() === "aceptadas") window.gtag("event", nombre, datos || {});
};

// ---------- Aviso (se arma con JavaScript para no repetir el HTML en todas las páginas) ----------
function crearAviso() {
    const aviso = document.createElement("div");
    aviso.className = "aviso-cookies";
    aviso.setAttribute("role", "dialog");
    aviso.setAttribute("aria-live", "polite");
    aviso.setAttribute("aria-label", "Aviso de cookies");

    const texto = document.createElement("p");
    texto.className = "aviso-cookies-texto";
    texto.append(
        "Usamos cookies de Google Analytics para saber cuántas personas visitan la web y mejorarla. " +
        "Solo se activan si las aceptas. "
    );
    const enlace = document.createElement("a");
    enlace.href = "/pages/cookies.html";
    enlace.textContent = "Más información";
    texto.appendChild(enlace);

    const botones = document.createElement("div");
    botones.className = "aviso-cookies-botones";

    const rechazar = document.createElement("button");
    rechazar.type = "button";
    rechazar.className = "aviso-cookies-btn aviso-cookies-rechazar";
    rechazar.textContent = "Rechazar";

    const aceptar = document.createElement("button");
    aceptar.type = "button";
    aceptar.className = "aviso-cookies-btn aviso-cookies-aceptar";
    aceptar.textContent = "Aceptar";

    botones.append(rechazar, aceptar);
    aviso.append(texto, botones);

    aceptar.addEventListener("click", () => {
        guardarDecisionCookies("aceptadas");
        cargarAnalytics();
        ocultarAviso(aviso);
    });

    rechazar.addEventListener("click", () => {
        const yaHabiaAceptado = !!window.gtag;
        guardarDecisionCookies("rechazadas");
        borrarCookiesAnalytics();
        ocultarAviso(aviso);
        // Analytics ya cargado no se puede "descargar": se recarga la página para detenerlo
        if (yaHabiaAceptado) location.reload();
    });

    document.body.appendChild(aviso);
    return aviso;
}

function mostrarAviso(aviso) {
    aviso.hidden = false;
    requestAnimationFrame(() => aviso.classList.add("visible"));
}

function ocultarAviso(aviso) {
    aviso.classList.remove("visible");
    setTimeout(() => { aviso.hidden = true; }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
    const decision = leerDecisionCookies();
    const aviso = crearAviso();

    if (decision === "aceptadas") {
        aviso.hidden = true;
        cargarAnalytics();
    } else if (decision === "rechazadas") {
        aviso.hidden = true;
    } else {
        mostrarAviso(aviso);
    }

    // Botones "Configurar cookies" (por ejemplo, en la Política de Cookies)
    document.querySelectorAll("[data-cookies-config]").forEach((boton) => {
        boton.addEventListener("click", (e) => {
            e.preventDefault();
            mostrarAviso(aviso);
        });
    });

    // Clics en WhatsApp: cuentan como contacto en Analytics (solo si se aceptaron las cookies)
    document.querySelectorAll('a[href*="wa.me"]').forEach((enlace) => {
        enlace.addEventListener("click", () => {
            window.odmEvento("contacto_whatsapp", { pagina: location.pathname });
        });
    });
});
