import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { metaModulo, NOMBRES_MODULO } from '../../models/evaluacionModel';
import { formatearPromedio } from '../../utils/format';
import { EmptyState } from '../ui/Ui';

const useEsAngosto = () => {
  const [angosto, setAngosto] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  );

  useEffect(() => {
    const consulta = window.matchMedia('(max-width: 640px)');
    const manejar = (evento) => setAngosto(evento.matches);
    consulta.addEventListener('change', manejar);
    return () => consulta.removeEventListener('change', manejar);
  }, []);

  return angosto;
};

const prepararDatos = (indicadores = []) =>
  indicadores.map((indicador) => ({
    id: indicador.modulo_id,
    nombre: NOMBRES_MODULO[indicador.modulo_id] || indicador.modulo,
    completo: indicador.modulo,
    promedio: indicador.promedio === null ? 0 : Number(indicador.promedio),
    real: indicador.promedio
  }));

const tooltipStyle = {
  border: '1px solid #E1E4E8',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(16, 24, 40, 0.12)',
  fontSize: 12
};

const EtiquetaTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const dato = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{dato.completo}</strong>
      <span>
        {dato.real === null || dato.real === undefined
          ? 'Sin datos'
          : `${formatearPromedio(dato.real)} / 5.00`}
      </span>
    </div>
  );
};

export const BarrasModulos = ({ indicadores = [], height = 280 }) => {
  const angosto = useEsAngosto();

  if (!indicadores.length) {
    return <EmptyState title="Sin indicadores disponibles">Aún no hay datos para graficar.</EmptyState>;
  }

  const datos = prepararDatos(indicadores);

  // En pantallas angostas se usa barra horizontal: los nombres de los ejes
  // permanecen legibles sin amontonar las etiquetas del eje X.
  if (angosto) {
    return (
      <div className="chart" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            layout="vertical"
            margin={{ top: 4, right: 26, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E6E8EC" />
            <XAxis
              type="number"
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 9, fill: '#5B6770' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="nombre"
              width={82}
              tick={{ fontSize: 9.5, fill: '#5B6770' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<EtiquetaTooltip />} cursor={{ fill: 'rgba(122, 28, 51, 0.06)' }} />
            <ReferenceLine x={3} stroke="#B38E5D" strokeDasharray="4 4" />
            <Bar dataKey="promedio" radius={[0, 5, 5, 0]} maxBarSize={18}>
              {datos.map((dato) => (
                <Cell
                  key={dato.id}
                  fill={metaModulo(dato.id).color}
                  opacity={dato.real === null ? 0.25 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 12, right: 12, left: -18, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E8EC" />
          <XAxis
            dataKey="nombre"
            tick={{ fontSize: 11, fill: '#5B6770' }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: '#5B6770' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<EtiquetaTooltip />} cursor={{ fill: 'rgba(122, 28, 51, 0.06)' }} />
          <ReferenceLine y={3} stroke="#B38E5D" strokeDasharray="4 4" />
          <Bar dataKey="promedio" radius={[5, 5, 0, 0]} maxBarSize={54}>
            {datos.map((dato) => (
              <Cell key={dato.id} fill={metaModulo(dato.id).color} opacity={dato.real === null ? 0.25 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RadarModulos = ({ indicadores = [], height = 260 }) => {
  if (!indicadores.length) {
    return <EmptyState title="Sin perfil disponible">Aún no hay datos para graficar.</EmptyState>;
  }

  const datos = prepararDatos(indicadores);

  return (
    <div className="chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={datos} outerRadius="72%">
          <PolarGrid stroke="#DDE0E5" />
          <PolarAngleAxis dataKey="nombre" tick={{ fontSize: 10, fill: '#5B6770' }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(valor, _nombre, item) => [
              item?.payload?.real === null
                ? 'Sin datos'
                : `${formatearPromedio(item?.payload?.real)} / 5.00`,
              'Promedio'
            ]}
          />
          <Radar
            name="Promedio"
            dataKey="promedio"
            stroke="#7A1C33"
            fill="#B38E5D"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MiniBarrasModulos = ({ modulos = {}, indicadores = [] }) => {
  const lista =
    indicadores.length > 0
      ? indicadores
      : Object.entries(NOMBRES_MODULO).map(([id]) => ({
          modulo_id: Number(id),
          modulo: NOMBRES_MODULO[id],
          promedio: modulos[id] ?? null
        }));

  return (
    <div className="mini-bars">
      {lista.map((modulo) => {
        const meta = metaModulo(Number(modulo.modulo_id));
        const valor = modulo.promedio === null ? 0 : Number(modulo.promedio);
        return (
          <div className="mini-bars__row" key={modulo.modulo_id}>
            <div className="mini-bars__label">
              <span className="mini-bars__dot" style={{ background: meta.color }} />
              <span>{modulo.modulo}</span>
              <strong>{modulo.promedio === null ? '—' : formatearPromedio(modulo.promedio)}</strong>
            </div>
            <div className="mini-bars__track">
              <span
                className="mini-bars__fill"
                style={{ width: `${(valor / 5) * 100}%`, background: meta.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
