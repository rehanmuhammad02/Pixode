import { Link } from "react-router-dom";
export default function Brand({
  to = "/",
  logo = "/assets/pixode-logo.png",
  compact = false,
}) {
  const original = logo || "/assets/pixode-logo.png";
  const source = original === "/assets/pixode-logo.png" ? "/assets/pixode-logo-transparent.png" : original;
  const custom = original !== "/assets/pixode-logo.png";
  return (
    <Link
      to={to}
      className={`brand ${compact ? "brand-compact" : ""}`}
      aria-label="Pixode home"
    >
      <span className={`brand-symbol ${custom ? "custom-symbol" : ""}`}>
        <img src={source} alt="" width="1254" height="1254" />
      </span>
      {!compact && <span className="brand-name">pixode</span>}
    </Link>
  );
}
