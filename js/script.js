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
