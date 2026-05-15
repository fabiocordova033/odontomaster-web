const categorySelect = document.getElementById("categorySelect");

const casesGrid = document.getElementById("casesGrid");

let clinicalCases = [];


/* CARGAR JSON */

fetch("casos.json")

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