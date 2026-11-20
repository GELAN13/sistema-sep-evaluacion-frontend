export const ROLES = {
  PRINCIPAL: 'ROL_PRINCIPAL',
  SUBSISTEMA: 'SUBSISTEMA',
  INSTITUCION: 'INSTITUCION'
};

export const ROLES_INFO = {
  [ROLES.PRINCIPAL]: {
    titulo: 'Autoridad educativa (SEV Veracruz)',
    tituloCorto: 'SEV Veracruz',
    descripcion:
      'Supervisión global de indicadores por tipo de control (público / privado), región, municipio, subsistema e institución del Estado de Veracruz.',
    rutaInicio: '/sep/dashboard',
    icono: 'shield',
    etiqueta: 'Rol SEV'
  },
  [ROLES.SUBSISTEMA]: {
    titulo: 'Subsistema / Universidad',
    tituloCorto: 'Universidad',
    descripcion:
      'Gestión y monitoreo de las facultades y planteles adscritos a la universidad.',
    rutaInicio: '/subsistema/dashboard',
    icono: 'building',
    etiqueta: 'Rol subsistema'
  },
  [ROLES.INSTITUCION]: {
    titulo: 'Institución / Facultad',
    tituloCorto: 'Institución',
    descripcion:
      'Respuesta del cuestionario de autoevaluación de los seis ejes estratégicos y consulta de resultados.',
    rutaInicio: '/institucion/evaluacion',
    icono: 'book',
    etiqueta: 'Rol institución'
  }
};

export const ROLES_REGISTRABLES = [ROLES.SUBSISTEMA, ROLES.INSTITUCION];

export const rutaInicioDeRol = (rol) => ROLES_INFO[rol]?.rutaInicio || '/login';
