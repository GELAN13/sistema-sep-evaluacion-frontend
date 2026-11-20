export const ESCALA = [
  { valor: 1, etiqueta: 'Muy deficiente', corta: 'Muy deficiente' },
  { valor: 2, etiqueta: 'Deficiente', corta: 'Deficiente' },
  { valor: 3, etiqueta: 'Regular', corta: 'Regular' },
  { valor: 4, etiqueta: 'Bueno', corta: 'Bueno' },
  { valor: 5, etiqueta: 'Óptimo', corta: 'Óptimo' }
];

export const MODULOS_META = {
  1: { icono: 'shield', color: '#7A1C33', clave: 'gobernanza' },
  2: { icono: 'coins', color: '#B38E5D', clave: 'inversion' },
  3: { icono: 'document', color: '#4B5563', clave: 'deuda' },
  4: { icono: 'users', color: '#0F766E', clave: 'inclusion' },
  5: { icono: 'chart', color: '#1D4ED8', clave: 'evaluacion' },
  6: { icono: 'building', color: '#9A3412', clave: 'infraestructura' }
};

export const NOMBRES_MODULO = {
  1: 'Gobernanza',
  2: 'Inversión',
  3: 'Deuda',
  4: 'Inclusión',
  5: 'Evaluación',
  6: 'Infraestructura'
};

export const nombreCortoModulo = (id, alterno = '') => NOMBRES_MODULO[id] || alterno;

export const metaModulo = (id) =>
  MODULOS_META[id] || { icono: 'chart', color: '#7A1C33', clave: 'modulo' };

export const calificarPromedio = (valor) => {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return { etiqueta: 'Pendiente', clase: 'pendiente' };
  }
  const numero = Number(valor);
  if (numero >= 4.5) return { etiqueta: 'Excelente', clase: 'excelente' };
  if (numero >= 4) return { etiqueta: 'Bueno', clase: 'bueno' };
  if (numero >= 3) return { etiqueta: 'En proceso', clase: 'proceso' };
  return { etiqueta: 'Área de mejora', clase: 'critico' };
};
