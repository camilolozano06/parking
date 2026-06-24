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

    let hoy = new Date().toISOString().split("T")[0];
    document.getElementById("fechaFiltro").value = hoy;

    actualizarTablas(false);
    filtrarHistorialPorFecha();
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

function formatearFecha(fecha) {
    return fecha.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

function obtenerDiaSemana(fecha) {
    return fecha.toLocaleDateString("es-CO", {
        weekday: "long"
    });
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

    let fechaISO = horaSalida.toISOString().split("T")[0];

    historialVehiculos.push({
        placa: placa,
        tipo: vehiculo.tipo,
        fechaISO: fechaISO,
        fechaTexto: formatearFecha(horaSalida),
        diaSemana: obtenerDiaSemana(horaSalida),
        horaIngreso: horaIngreso.toLocaleTimeString(),
        horaSalida: horaSalida.toLocaleTimeString(),
        minutos: minutos,
        total: formatearDinero(total),
        totalNumero: total
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

    document.getElementById("fechaFiltro").value = fechaISO;

    actualizarTablas();
    filtrarHistorialPorFecha();
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
        recaudo += Number(vehiculo.totalNumero || 0);
    });

    document.getElementById("totalCarros").textContent = carros;
    document.getElementById("totalMotos").textContent = motos;
    document.getElementById("ocupacion").textContent = Object.keys(vehiculosActivos).length;
    document.getElementById("recaudoTotal").textContent = formatearDinero(recaudo);
}

function actualizarTablas(guardar = true) {
    let tablaActivos = document.getElementById("tablaActivos");

    tablaActivos.innerHTML = "";

    for (let placa in vehiculosActivos) {
        tablaActivos.innerHTML += `
            <tr>
                <td>${placa}</td>
                <td>${vehiculosActivos[placa].tipo}</td>
                <td>${vehiculosActivos[placa].horaIngreso.toLocaleTimeString()}</td>
            </tr>
        `;
    }

    actualizarDashboard();

    if (guardar) {
        guardarDatos();
    }
}

function filtrarHistorialPorFecha() {
    let fechaSeleccionada = document.getElementById("fechaFiltro").value;
    let tablaHistorial = document.getElementById("tablaHistorial");

    tablaHistorial.innerHTML = "";

    let historialDia = historialVehiculos.filter(function (vehiculo) {
        return vehiculo.fechaISO === fechaSeleccionada;
    });

    historialDia.sort(function (a, b) {
        return a.horaSalida.localeCompare(b.horaSalida);
    });

    let carrosDia = 0;
    let motosDia = 0;
    let recaudoDia = 0;

    historialDia.forEach(function (vehiculo) {
        if (vehiculo.tipo === "carro") {
            carrosDia++;
        } else {
            motosDia++;
        }

        recaudoDia += Number(vehiculo.totalNumero || 0);

        tablaHistorial.innerHTML += `
            <tr>
                <td>${vehiculo.fechaTexto}</td>
                <td>${vehiculo.diaSemana}</td>
                <td>${vehiculo.horaIngreso}</td>
                <td>${vehiculo.horaSalida}</td>
                <td>${vehiculo.placa}</td>
                <td>${vehiculo.tipo}</td>
                <td>${vehiculo.minutos} min</td>
                <td>${vehiculo.total}</td>
            </tr>
        `;
    });

    document.getElementById("vehiculosDia").textContent = historialDia.length;
    document.getElementById("carrosDia").textContent = carrosDia;
    document.getElementById("motosDia").textContent = motosDia;
    document.getElementById("recaudoDia").textContent = formatearDinero(recaudoDia);

    if (historialDia.length === 0) {
        tablaHistorial.innerHTML = `
            <tr>
                <td colspan="8">No hay registros para esta fecha.</td>
            </tr>
        `;
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
        "<th>Día</th>" +
        "<th>Tipo</th>" +
        "<th>Hora ingreso</th>" +
        "<th>Hora salida</th>" +
        "<th>Tiempo</th>" +
        "<th>Total pagado</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>";

    resultados.forEach(function (vehiculo, index) {
        totalPagado += Number(vehiculo.totalNumero || 0);

        html +=
            "<tr>" +
            "<td>" + (index + 1) + "</td>" +
            "<td>" + vehiculo.fechaTexto + "</td>" +
            "<td>" + vehiculo.diaSemana + "</td>" +
            "<td>" + vehiculo.tipo + "</td>" +
            "<td>" + vehiculo.horaIngreso + "</td>" +
            "<td>" + vehiculo.horaSalida + "</td>" +
            "<td>" + vehiculo.minutos + " min</td>" +
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