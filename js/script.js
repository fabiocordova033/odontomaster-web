const slides = document.querySelectorAll('.slide');

if (slides.length > 0) {

    const next = document.querySelector('.next');
    const prev = document.querySelector('.prev');

    let index = 0;

    function showSlide(i) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[i].classList.add('active');
    }

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


const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav-menu");

toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
});



const container = document.querySelector(".testimonial-cards");

setInterval(() => {

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

    window.intlTelInput(input, {

        initialCountry: "pe",

        preferredCountries: ["pe", "mx", "co", "us"],

        separateDialCode: true,

    });




// ✅ Inicializa EmailJS

(function() {
    emailjs.init("gG5IGnoQ3-VQm8HTM");
})();

// Manejar envío del formulario
document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita recargar la página

    const statusMsg = document.getElementById("form-status");
    const submitBtn = document.querySelector(".btn-submit");

    // Mostrar estado de carga
    if (statusMsg) {
        statusMsg.textContent = "⏳ Enviando mensaje...";
        statusMsg.style.color = "#0066cc";
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    // Obtener valores del formulario
    const formData = {
        nombre: document.getElementById("nombre").value,
        apellidos: document.getElementById("apellidos").value,
        telefono: document.getElementById("telefono").value,
        email: document.getElementById("email").value,
        especialidad: document.getElementById("especialidad").value
    };

    // Enviar email
    emailjs.send("service_sst69v2", "template_s9ltvah", formData)
        .then(function(response) {
            // ✅ ÉXITO
            console.log("✅ Éxito:", response);
            
            if (statusMsg) {
                statusMsg.textContent = "✅ ¡Mensaje enviado! Te contactaremos pronto.";
                statusMsg.style.color = "green";
            } else {
                alert("✅ ¡Mensaje enviado! Te contactaremos pronto.");
            }
            
            // Limpiar formulario
            document.getElementById("contact-form").reset();
            
            // Restaurar botón
            setTimeout(function() {
                submitBtn.disabled = false;
                submitBtn.textContent = "Enviar";
                if (statusMsg) statusMsg.textContent = "";
            }, 3000);
        })
        .catch(function(error) {
            // ❌ ERROR
            console.error("❌ Error:", error);
            
            if (statusMsg) {
                statusMsg.textContent = "❌ Error al enviar. Intenta de nuevo.";
                statusMsg.style.color = "red";
            } else {
                alert("❌ Error al enviar. Intenta de nuevo.");
            }
            
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar";
        });
});

