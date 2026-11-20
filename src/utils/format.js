export const formatearPromedio = (valor, decimales = 2) => {
  if (valor === null || valor === undefined || valor === '') return '—';
  const numero = Number(valor);
  if (Number.isNaN(numero)) return '—';
  return numero.toFixed(decimales);
};

export const formatearEntero = (valor) =>
  new Intl.NumberFormat('es-MX').format(Number(valor) || 0);

export const formatearFecha = (valor) => {
  if (!valor) return 'Sin registro';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'Sin registro';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fecha);
};

export const formatearFechaCorta = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(fecha);
};

export const descargarCsv = (nombreArchivo, columnas, filas) => {
  const escapar = (valor) => {
    const texto = valor === null || valor === undefined ? '' : String(valor);
    return `"${texto.replaceAll('"', '""')}"`;
  };

  const encabezado = columnas.map((columna) => escapar(columna.etiqueta)).join(',');
  const cuerpo = filas
    .map((fila) => columnas.map((columna) => escapar(fila[columna.clave])).join(','))
    .join('\r\n');

  // BOM para que Excel reconozca UTF-8 correctamente.
  const contenido = `\uFEFF${encabezado}\r\n${cuerpo}`;
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombreArchivo}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
};

export const clasePromedio = (valor) => {
  if (valor === null || valor === undefined) return 'pendiente';
  const numero = Number(valor);
  if (numero >= 4.5) return 'excelente';
  if (numero >= 4) return 'bueno';
  if (numero >= 3) return 'proceso';
  return 'critico';
};
