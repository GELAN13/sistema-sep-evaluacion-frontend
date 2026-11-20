const paths = {
  shield: (
    <path d="M12 3l7 3v5.2c0 4.4-3 8.4-7 9.8-4-1.4-7-5.4-7-9.8V6l7-3z" />
  ),
  building: (
    <>
      <path d="M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16" />
      <path d="M15 9h4a1 1 0 011 1v11M3 21h18" />
      <path d="M8 8h3M8 12h3M8 16h3" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 016.5 3H20v18H6.5A2.5 2.5 0 004 23V5.5z" />
      <path d="M4 18.5A2.5 2.5 0 016.5 16H20M8 7h8M8 11h6" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v4c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 10v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4" />
      <path d="M4 14v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" />
      <path d="M14 3v6h6M8 13h8M8 17h6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M16 5.3a3 3 0 010 5.8M18 20c0-2.6-.9-4.4-2.5-5.4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />,
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
  alert: (
    <>
      <path d="M12 3l9.5 17H2.5L12 3z" />
      <path d="M12 9v4.5M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5h.01" />
    </>
  ),
  arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M16 16l5 5" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3M12 14v3" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 10-2.3 6.3" />
      <path d="M20 5v6h-6" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="17" rx="2" />
      <path d="M9 3h6v4H9zM9 11h6M9 15h6M9 19h3" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.5L7 22l5-2.5L17 22l-1.5-8.5" />
    </>
  )
};

export const Icon = ({ name, size = 20, className = '', strokeWidth = 1.8 }) => {
  const contenido = paths[name] || paths.info;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
    >
      {contenido}
    </svg>
  );
};

export default Icon;
