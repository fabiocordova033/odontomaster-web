// ================== AVISO DE COOKIES + GOOGLE TAG MANAGER / ANALYTICS ==================
// Google Tag Manager (o Google Analytics) solo se carga si el visitante pulsa "Aceptar".
// Mientras no decida (o si rechaza) no se carga nada de Google ni se crean sus cookies.
// La decisión se guarda en el navegador (localStorage "odm-cookies") y se puede cambiar
// desde la Política de Cookies o con cualquier elemento que tenga data-cookies-config.

// 👉 ID de Google: sirve uno de Google Tag Manager ("GTM-...") o de Google Analytics 4 ("G-...").
//    Con GTM, la etiqueta de Google Analytics se configura dentro del contenedor de GTM.
const GA_ID = "GTM-TKSLMSDH";

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

const ES_GTM = /^GTM-[A-Z0-9]+$/.test(GA_ID);

function idAnalyticsValido() {
    return (ES_GTM || /^G-[A-Z0-9]+$/.test(GA_ID)) && GA_ID !== "G-XXXXXXXXXX";
}

// Carga Google Tag Manager o Google Analytics (solo una vez)
let googleCargado = false;
function cargarAnalytics() {
    if (!idAnalyticsValido() || googleCargado) return;
    googleCargado = true;

    window.dataLayer = window.dataLayer || [];
    const script = document.createElement("script");
    script.async = true;

    if (ES_GTM) {
        // Mismo arranque que el código oficial de GTM, sin script en línea (lo bloquearía la seguridad de _headers)
        window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
        script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GA_ID);
    } else {
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag("js", new Date());
        window.gtag("config", GA_ID);
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    }
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
// Con GTM llega como "Evento personalizado" (generate_lead, contacto_whatsapp, contacto_llamada)
window.odmEvento = function (nombre, datos) {
    if (!googleCargado || leerDecisionCookies() !== "aceptadas") return;
    if (ES_GTM) window.dataLayer.push(Object.assign({ event: nombre }, datos || {}));
    else if (window.gtag) window.gtag("event", nombre, datos || {});
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
        const yaHabiaAceptado = googleCargado;
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

    // Clics en WhatsApp y en Llamar: cuentan como contacto en Analytics (solo si se aceptaron las cookies)
    document.querySelectorAll('a[href*="wa.me"]').forEach((enlace) => {
        enlace.addEventListener("click", () => {
            window.odmEvento("contacto_whatsapp", { pagina: location.pathname });
        });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach((enlace) => {
        enlace.addEventListener("click", () => {
            window.odmEvento("contacto_llamada", { pagina: location.pathname });
        });
    });
});
