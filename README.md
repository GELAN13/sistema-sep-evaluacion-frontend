# Sistema de Evaluación Institucional - Frontend (SEV Veracruz)

Aplicación web React + Vite desarrollada para la **Secretaría de Educación de Veracruz (SEV)**. Provee tableros de indicadores, autoevaluación institucional y filtros para instituciones públicas y particulares con RVOE en el Estado de Veracruz.

---

## Requisitos

- **Node.js** v18+
- Servidor backend corriendo (puerto 4000 por defecto)

---

## Puesta en marcha rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/GELAN13/sistema-sep-evaluacion-frontend.git
cd sistema-sep-evaluacion-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar entorno (opcional)
Por defecto, la API se conecta a `http://localhost:4000/api`. Si requieres otra URL, crea un archivo `.env`:
```ini
VITE_API_URL=http://localhost:4000/api
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación abrirá en [http://localhost:5173](http://localhost:5173).

### 5. Compilar para producción
```bash
npm run build
```
Genera la carpeta optimizada `dist/`.

---

## Características Principales

- **Identidad oficial SEV Veracruz**:
  - Logotipo oficial de la Secretaría de Educación de Veracruz.
  - Colores institucionales (Guinda, Oro, Neutros).
- **Filtros avanzados para la SEV**:
  - **1. Instituciones Públicas**: Estatales y Federales.
  - **2. Universidades Privadas con RVOE**: Estatal (SEV) y Federal (SEP).
  - Regiones de Veracruz (*Capital, Sotavento, Las Montañas, etc.*) y municipios.
  - **Buscador reactivo en tiempo real** para filtrar instantáneamente sobre la tabla de instituciones.
- **Módulo de Registro Institucional (`/registro`)**:
  - Diseño split con panel institucional.
  - **Buscador interactivo** para localizar universidades y facultades fácilmente sin depender de listas estáticas extensas.
- **Captura y evaluación de los 6 ejes estratégicos**:
  - Gobernanza, Inversión, Deuda, Inclusión, Evaluación e Infraestructura.
  - Gráficas de radar y barras con promedios estatales.
