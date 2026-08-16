const categorySelect = document.getElementById("categorySelect");

const casesGrid = document.getElementById("casesGrid");

let clinicalCases = [];


/* CARGAR JSON */

fetch("../data/casos.json")

    .then(response => response.json())

    .then(data => {

        clinicalCases = data;

        renderCases("Endodoncia");

    });


/* MOSTRAR IMAGENES */

function renderCases(category) {

    casesGrid.innerHTML = "";

    const filteredCases = category === "todos"

        ? clinicalCases

        : clinicalCases.filter(item => item.categoria === category);


    filteredCases.forEach(item => {

        const div = document.createElement("div");

        div.classList.add("case-item");

        div.innerHTML = `

            <img src="${item.imagen}" alt="Caso Clinico">

        `;

        casesGrid.appendChild(div);

    });
}


/* CAMBIO SELECT */

categorySelect.addEventListener("change", () => {

    renderCases(categorySelect.value);

}); 




// Texto de descripción por tratamiento (puedes editarlo)
const descripcionesTratamientos = {
  "Resinas De Alta Estética":
    "Restaura tus dientes con resinas del color del diente para una sonrisa natural y armoniosa.",
  "Prótesis Bucales":
    "Soluciones fijas o removibles para reemplazar piezas perdidas y recuperar tu función masticatoria.",
  "Periodoncia":
    "Tratamientos especializados para cuidar y mantener sanas tus encías y el soporte de tus dientes.",
  "Ortodoncia":
    "Corrige la posición de tus dientes para lograr una mordida funcional y una sonrisa estética.",
  "Odontopediatría":
    "Atención especializada para los más pequeños, cuidando su salud bucal desde temprana edad.",
  "Implantología":
    "Reemplazo de piezas dentales mediante implantes que imitan la raíz natural del diente.",
  "Endodoncia":
    "Tratamiento del nervio del diente para eliminar el dolor y conservar la pieza dental.",
  "Cirugía Maxilofacial":
    "Procedimientos quirúrgicos para corregir problemas óseos, funcionales y estéticos de la boca.",
  "Carillas Dentales":
    "Láminas delgadas que corrigen forma, tamaño y color de los dientes para una sonrisa perfecta.",
  "Blanqueamiento Dental":
    "Tratamiento seguro y profesional para aclarar el tono de tus dientes y rejuvenecer tu sonrisa."
};

// Posicionar los items en círculo según data-angle
const items = document.querySelectorAll(".tc-item");
const circulo = document.querySelector(".tc-circle");

// Radio desde el centro (ajustable)
const radio = 240; // px

items.forEach((item) => {
  const angulo = parseFloat(item.dataset.angle); // en grados
  const rad = (angulo * Math.PI) / 180;

  const centerX = circulo.clientWidth / 2;
  const centerY = circulo.clientHeight / 2;

  const x = centerX + radio * Math.cos(rad);
  const y = centerY + radio * Math.sin(rad);

  item.style.left = x + "px";
  item.style.top = y + "px";
});

// ===== A PARTIR DE AQUÍ CAMBIA =====

// Referencias a descripción e imagen central
const descripcion = document.getElementById("tc-descripcion");
const imagenCentral = document.getElementById("tc-imagen-central");

// Guardar estado por defecto
const descripcionDefault = descripcion ? descripcion.textContent : "";
const imagenDefault = imagenCentral ? imagenCentral.src : "";

// HOVER en lugar de CLICK
items.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    const texto = item.textContent.trim();

    // Cambiar descripción
    if (descripcion) {
      descripcion.textContent =
        descripcionesTratamientos[texto] ||
        "Tratamiento especializado para mejorar tu salud y estética dental.";
    }

    // Cambiar imagen
    const nuevaImagen = item.dataset.image; // viene del HTML: data-image="..."
    if (imagenCentral && nuevaImagen) {
      imagenCentral.src = nuevaImagen;
    }

    // (Opcional) estilo activo
    // items.forEach((i) => i.classList.remove("tc-activo"));
    // item.classList.add("tc-activo");
  });

  item.addEventListener("mouseleave", () => {
    // Volver a descripción e imagen por defecto
    if (descripcion) descripcion.textContent = descripcionDefault;
    if (imagenCentral && imagenDefault) imagenCentral.src = imagenDefault;

    // (Opcional) quitar activo
    // item.classList.remove("tc-activo");
  });
});


// Activar uno por defecto
//if (items[0]) {
//  items[0].click();
//}
