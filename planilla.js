// planilla.js
// Lógica para renderizar la plantilla y generar el PDF con html2pdf

// Demo: estructura esperada de 'ventasDelDia'
// Cada "salida" / bus tiene: unidad, chofer, hora, asientos: [{nro, pasajero, destino, monto}]
const ventasDelDiaDemo = [
  {
    unidad: "EL HERBIE",
    chofer: "Sabino",
    hora: "16:00",
    asientos: [
      { nro: 1, pasajero: "Pamela", destino: "T.B.", monto: 20.00 },
      { nro: 2, pasajero: "Ximena", destino: "P.C.", monto: 15.00 }
    ]
  },
  {
    unidad: "LA FURIA",
    chofer: "Carlos",
    hora: "18:30",
    asientos: [
      { nro: 1, pasajero: "Luis", destino: "T.B.", monto: 25.00 },
      { nro: 2, pasajero: "María", destino: "P.C.", monto: 15.00 },
      { nro: 3, pasajero: "Ana", destino: "P.C.", monto: 15.00 }
    ]
  }
];

function formateaBs(v) { return parseFloat(v).toFixed(2); }

function renderBusesEnPlantilla(ventas) {
  const cont = document.getElementById('pdf-bloque-buses');
  cont.innerHTML = ''; // limpiar

  ventas.forEach(salida => {
    // calcular subtotal por bus
    const subtotal = salida.asientos.reduce((sum, a) => sum + Number(a.monto || 0), 0);

    // crear bloque
    const bloque = document.createElement('div');
    bloque.className = 'bus-seccion';

    const header = document.createElement('div');
    header.className = 'bus-header';
    header.textContent = `UNIDAD: ${salida.unidad} | CHOFER: ${salida.chofer} | HORA: ${salida.hora}`;
    bloque.appendChild(header);

    const table = document.createElement('table');
    table.className = 'pdf-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Nº Asiento</th>
          <th>Pasajero</th>
          <th>Destino</th>
          <th style="text-align: right;">Monto (Bs)</th>
        </tr>
      </thead>
      <tbody>
        ${salida.asientos.map(a => `
          <tr>
            <td>${a.nro}</td>
            <td>${a.pasajero}</td>
            <td>${a.destino}</td>
            <td style="text-align: right;">${formateaBs(a.monto)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    bloque.appendChild(table);

    const subDiv = document.createElement('div');
    subDiv.style = 'text-align: right; font-weight: bold; font-size: 11px; margin-top: 4px;';
    subDiv.innerHTML = `Subtotal Bus: Bs. <span class="subtotal-bus">${formateaBs(subtotal)}</span>`;
    bloque.appendChild(subDiv);

    cont.appendChild(bloque);
  });
}

function calcularTotalPasajes(ventas) {
  return ventas.reduce((t, salida) => {
    return t + salida.asientos.reduce((s, a) => s + Number(a.monto || 0), 0);
  }, 0);
}

function descargarPlanillaDiariaPDF(ventasDelDia) {
  // 1. Fecha
  const fechaHoy = new Date().toLocaleDateString('es-BO');
  document.getElementById('pdf-fecha').innerText = fechaHoy;

  // 2. Otros ingresos (manual)
  const inputOtros = parseFloat(document.getElementById('input-otros-ingresos').value) || 0;

  // 3. Renderizar buses
  renderBusesEnPlantilla(ventasDelDia);

  // 4. Totales
  const totalPasajes = calcularTotalPasajes(ventasDelDia);
  const totalGeneral = totalPasajes + inputOtros;

  document.getElementById('pdf-total-pasajes').innerText = formateaBs(totalPasajes);
  document.getElementById('pdf-otros-ingresos').innerText = formateaBs(inputOtros);
  document.getElementById('pdf-total-general').innerText = formateaBs(totalGeneral);

  // 5. Mostrar temporalmente la plantilla (necesario para html2pdf)
  const elementoPDF = document.getElementById('plantilla-pdf');
  elementoPDF.style.display = 'block';

  // Opciones
  const opciones = {
    margin:       10,
    filename:     `Planilla_Diaria_LIRUJHAN_${fechaHoy.replace(/\//g, '-')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }
  };

  // Generar y descargar
  html2pdf().set(opciones).from(elementoPDF).save().then(() => {
    elementoPDF.style.display = 'none';
  }).catch(err => {
    console.error('Error generando PDF:', err);
    elementoPDF.style.display = 'none';
  });
}

// Si quieres usar datos reales de Firebase / Supabase reemplaza esta función
// por una llamada que obtenga las ventas del día.
// Ejemplo (pseudo):
// async function fetchVentasDelDia(fecha) { /* consultar tu BD y devolver array */ }

document.getElementById('btn-descargar').addEventListener('click', () => {
  // Aquí puedes cambiar ventasDelDiaDemo por la data real si la consultas antes.
  descargarPlanillaDiariaPDF(ventasDelDiaDemo);
});

// Render inicial en la página para previsualizar
renderBusesEnPlantilla(ventasDelDiaDemo);
