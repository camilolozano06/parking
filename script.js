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

    if (carro.test(placaParametro)) return "carro";
    if (moto.test(placaParametro)) return "moto";

    return "invalida";
}

function calcularTarifa(tipoParametro, minutosParametro) {
    let tarifa = tipoParametro === "carro" ? 250 : 150;
    return tarifa * minutosParametro;
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
        horaIngreso: horaIngreso.toLocaleTimeString(),
        horaSalida: horaSalida.toLocaleTimeString(),
        total: "$" + total
    });

    delete vehiculosActivos[placa];

    mostrarPopup(
        "Vehículo retirado correctamente<br><br>" +
        "Placa: " + placa + "<br>" +
        "Tipo: " + vehiculo.tipo + "<br>" +
        "Hora ingreso: " + horaIngreso.toLocaleTimeString() + "<br>" +
        "Hora salida: " + horaSalida.toLocaleTimeString() + "<br>" +
        "Tiempo: " + minutos + " minuto(s)<br>" +
        "Total a pagar: $" + total,
        "exito"
    );

    document.getElementById("placa").value = "";
    actualizarTablas();
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

    if (guardar) guardarDatos();
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