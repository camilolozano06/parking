let vehiculosActivos = {};
let historialVehiculos = [];

function mostrarPopup(mensaje, tipo = "exito") {
    let popupAnterior = document.querySelector(".popup");

    if (popupAnterior) {
        popupAnterior.remove();
    }

    let popup = document.createElement("div");
    popup.className = "popup " + tipo;
    popup.innerHTML = mensaje;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 30000);
}

function guardarDatos() {
    localStorage.setItem("vehiculosActivos", JSON.stringify(vehiculosActivos));
    localStorage.setItem("historialVehiculos", JSON.stringify(historialVehiculos));
}

function cargarDatos() {
    let activosGuardados = localStorage.getItem("vehiculosActivos");
    let historialGuardado = localStorage.getItem("historialVehiculos");

    if (activosGuardados) {
        vehiculosActivos = JSON.parse(activosGuardados);

        for (let placa in vehiculosActivos) {
            vehiculosActivos[placa].horaIngreso =
                new Date(vehiculosActivos[placa].horaIngreso);
        }
    }

    if (historialGuardado) {
        historialVehiculos = JSON.parse(historialGuardado);
    }

    actualizarTablas(false);
}

function identificarTipo(placaParametro) {
    let carro = /^[A-Z]{3}[0-9]{3}$/;
    let moto = /^[A-Z]{3}[0-9]{2}[A-Z]{1}$/;

    if (carro.test(placaParametro)) {
        return "carro";
    }

    if (moto.test(placaParametro)) {
        return "moto";
    }

    return "invalida";
}

function calcularTarifa(tipoParametro, minutosParametro) {
    let tarifa = tipoParametro === "carro" ? 250 : 150;
    return tarifa * minutosParametro;
}

function formatearDinero(valor) {
    return "$" + valor.toLocaleString("es-CO");
}

function ingresarVehiculo() {
    let placa = document.getElementById("placa").value.toUpperCase().trim();

    if (placa === "") {
        mostrarPopup("Por favor ingrese una placa", "error");
        return;
    }

    let tipoVehiculo = identificarTipo(placa);

    if (tipoVehiculo === "invalida") {
        mostrarPopup("Formato inválido.<br>Carro: ABC123 / Moto: ABC12D", "error");
        return;
    }

    if (vehiculosActivos[placa]) {
        mostrarPopup("Vehículo ya registrado", "error");
        return;
    }

    vehiculosActivos[placa] = {
        tipo: tipoVehiculo,
        horaIngreso: new Date()
    };

    mostrarPopup(
        "Vehículo ingresado correctamente<br><br>" +
        "Placa: " + placa + "<br>" +
        "Tipo: " + tipoVehiculo,
        "exito"
    );

    document.getElementById("placa").value = "";
    actualizarTablas();
}

function salirVehiculo() {
    let placa = document.getElementById("placa").value.toUpperCase().trim();

    if (placa === "") {
        mostrarPopup("Por favor ingrese una placa", "error");
        return;
    }

    if (!vehiculosActivos[placa]) {
        mostrarPopup("Vehículo no encontrado", "error");
        return;
    }

    let vehiculo = vehiculosActivos[placa];
    let horaIngreso = vehiculo.horaIngreso;
    let horaSalida = new Date();

    let minutos = Math.ceil((horaSalida - horaIngreso) / 60000);
    let total = calcularTarifa(vehiculo.tipo, minutos);

    historialVehiculos.push({
        placa: placa,
        tipo: vehiculo.tipo,
        fecha: horaSalida.toLocaleDateString("es-CO"),
        horaIngreso: horaIngreso.toLocaleTimeString(),
        horaSalida: horaSalida.toLocaleTimeString(),
        minutos: minutos,
        total: formatearDinero(total)
    });

    delete vehiculosActivos[placa];

    mostrarPopup(
        "Vehículo retirado correctamente<br><br>" +
        "Placa: " + placa + "<br>" +
        "Tipo: " + vehiculo.tipo + "<br>" +
        "Hora ingreso: " + horaIngreso.toLocaleTimeString() + "<br>" +
        "Hora salida: " + horaSalida.toLocaleTimeString() + "<br>" +
        "Tiempo: " + minutos + " minuto(s)<br>" +
        "Total a pagar: " + formatearDinero(total),
        "exito"
    );

    document.getElementById("placa").value = "";
    actualizarTablas();
}

function actualizarDashboard() {
    let carros = 0;
    let motos = 0;
    let recaudo = 0;

    for (let placa in vehiculosActivos) {
        if (vehiculosActivos[placa].tipo === "carro") {
            carros++;
        } else {
            motos++;
        }
    }

    historialVehiculos.forEach(function (vehiculo) {
        let valor = vehiculo.total.replace("$", "").replace(/\./g, "");
        recaudo += Number(valor);
    });

    document.getElementById("totalCarros").textContent = carros;
    document.getElementById("totalMotos").textContent = motos;
    document.getElementById("ocupacion").textContent = Object.keys(vehiculosActivos).length;
    document.getElementById("recaudoTotal").textContent = formatearDinero(recaudo);
}

function actualizarTablas(guardar = true) {
    let tablaActivos = document.getElementById("tablaActivos");
    let tablaHistorial = document.getElementById("tablaHistorial");

    tablaActivos.innerHTML = "";
    tablaHistorial.innerHTML = "";

    for (let placa in vehiculosActivos) {
        tablaActivos.innerHTML += `
            <tr>
                <td>${placa}</td>
                <td>${vehiculosActivos[placa].tipo}</td>
                <td>${vehiculosActivos[placa].horaIngreso.toLocaleTimeString()}</td>
            </tr>
        `;
    }

    historialVehiculos.forEach(function (vehiculo) {
        tablaHistorial.innerHTML += `
            <tr>
                <td>${vehiculo.placa}</td>
                <td>${vehiculo.tipo}</td>
                <td>${vehiculo.horaIngreso}</td>
                <td>${vehiculo.horaSalida}</td>
                <td>${vehiculo.total}</td>
            </tr>
        `;
    });

    actualizarDashboard();

    if (guardar) {
        guardarDatos();
    }
}

function buscarHistorialPlaca() {
    let placaBuscada = document
        .getElementById("buscarPlaca")
        .value
        .toUpperCase()
        .trim();

    let resultadoBusqueda = document.getElementById("resultadoBusqueda");
    resultadoBusqueda.innerHTML = "";

    if (placaBuscada === "") {
        mostrarPopup("Por favor ingrese una placa para buscar", "error");
        return;
    }

    let resultados = historialVehiculos.filter(function (vehiculo) {
        return vehiculo.placa === placaBuscada;
    });

    if (resultados.length === 0) {
        resultadoBusqueda.innerHTML =
            "<p>No se encontró historial para la placa <strong>" +
            placaBuscada +
            "</strong>.</p>";
        return;
    }

    let totalPagado = 0;

    let html =
        "<h2>Historial de la placa " + placaBuscada + "</h2>" +
        "<table>" +
        "<thead>" +
        "<tr>" +
        "<th>#</th>" +
        "<th>Fecha</th>" +
        "<th>Tipo</th>" +
        "<th>Hora ingreso</th>" +
        "<th>Hora salida</th>" +
        "<th>Tiempo</th>" +
        "<th>Total pagado</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>";

    resultados.forEach(function (vehiculo, index) {
        let valor = vehiculo.total.replace("$", "").replace(/\./g, "");
        totalPagado += Number(valor);

        html +=
            "<tr>" +
            "<td>" + (index + 1) + "</td>" +
            "<td>" + (vehiculo.fecha || "Sin fecha") + "</td>" +
            "<td>" + vehiculo.tipo + "</td>" +
            "<td>" + vehiculo.horaIngreso + "</td>" +
            "<td>" + vehiculo.horaSalida + "</td>" +
            "<td>" + (vehiculo.minutos || "-") + " min</td>" +
            "<td>" + vehiculo.total + "</td>" +
            "</tr>";
    });

    html +=
        "</tbody>" +
        "</table>" +
        "<p class='total-busqueda'>Total pagado por esta placa: " +
        formatearDinero(totalPagado) +
        "</p>";

    resultadoBusqueda.innerHTML = html;
}

function actualizarFechaHora() {
    const ahora = new Date();

    const opciones = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };

    document.getElementById("fechaHora").textContent =
        ahora.toLocaleDateString("es-CO", opciones);
}

setInterval(actualizarFechaHora, 1000);
actualizarFechaHora();
cargarDatos();