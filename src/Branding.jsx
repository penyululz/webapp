function BrandLogo({ theme }) {
  const src =
    theme === "light"
      ? "/brand/logo-light-compact.svg"
      : "/brand/logo-dark-compact.svg";

  return <img className="brand__logo" src={src} alt="Webapp Hub" />;
}

function ThemeIcon({ theme }) {
  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-toggle__icon">
        <path
          d="M21 12.8A9 9 0 0 1 11.2 3a1 1 0 0 0-1.3 1.2 7.5 7.5 0 1 0 9.9 9.9 1 1 0 0 0 1.2-1.3Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-toggle__icon">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <path
        d="M12 1.75v3M12 19.25v3M4.75 12h-3M22.25 12h-3M5.64 5.64 3.52 3.52M20.48 20.48l-2.12-2.12M18.36 5.64l2.12-2.12M3.52 20.48l2.12-2.12"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export { BrandLogo, ThemeIcon };
