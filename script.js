let vehiculos = {};

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
    let tarifa = 0;

    if (tipoParametro === "carro") {
        tarifa = 250;
    } else {
        tarifa = 150;
    }

    return tarifa * minutosParametro;
}

function ingresarVehiculo() {
    let placa = document
        .getElementById("placa")
        .value
        .toUpperCase();

    if (placa === "") {
        alert("Por favor ingrese una placa");
        return;
    }

    let tipoVehiculo = identificarTipo(placa);

    if (tipoVehiculo === "invalida") {
        alert("Formato inválido. Carro: ABC123 / Moto: ABC12D");
        return;
    }

    if (vehiculos[placa]) {
        alert("Vehículo ya registrado");
        return;
    }

    vehiculos[placa] = {
        tipo: tipoVehiculo,
        horaIngreso: new Date(),
        horaSalida: "-",
        total: "-"
    };

    document.getElementById("resultado").innerHTML =
        "Vehículo ingresado correctamente<br><br>" +
        "Placa: " + placa + "<br>" +
        "Tipo: " + tipoVehiculo;

    actualizarTabla();
}

function salirVehiculo() {
    let placa = document
        .getElementById("placa")
        .value
        .toUpperCase();

    if (placa === "") {
        alert("Por favor ingrese una placa");
        return;
    }

    if (!vehiculos[placa]) {
        alert("Vehículo no encontrado");
        return;
    }

    let horaIngreso = vehiculos[placa].horaIngreso;
    let horaSalida = new Date();

    let diferenciaMilisegundos = horaSalida - horaIngreso;

    let minutos = Math.ceil(
        diferenciaMilisegundos / 60000
    );

    let total = calcularTarifa(
        vehiculos[placa].tipo,
        minutos
    );

    vehiculos[placa].horaSalida =
        horaSalida.toLocaleTimeString();

    vehiculos[placa].total =
        "$" + total;

    document.getElementById("resultado").innerHTML =
        "Vehículo retirado correctamente<br><br>" +
        "Placa: " + placa + "<br>" +
        "Tipo: " + vehiculos[placa].tipo + "<br>" +
        "Hora ingreso: " + horaIngreso.toLocaleTimeString() + "<br>" +
        "Hora salida: " + horaSalida.toLocaleTimeString() + "<br>" +
        "Tiempo: " + minutos + " minuto(s)<br>" +
        "Total a pagar: $" + total;

    actualizarTabla();
}

function actualizarTabla() {
    let tabla = document.getElementById("tablaVehiculos");

    tabla.innerHTML = "";

    for (let placa in vehiculos) {
        let fila = `
            <tr>
                <td>${placa}</td>
                <td>${vehiculos[placa].tipo}</td>
                <td>${vehiculos[placa].horaIngreso.toLocaleTimeString()}</td>
                <td>${vehiculos[placa].horaSalida}</td>
                <td>${vehiculos[placa].total}</td>
            </tr>
        `;

        tabla.innerHTML += fila;
    }
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