export default function SectionHeading({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
