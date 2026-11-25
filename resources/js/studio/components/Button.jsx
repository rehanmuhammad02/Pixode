import Icon from "./Icon";
export default function Button({
  children,
  icon = "arrow-up-right",
  variant = "primary",
  className = "",
  href,
  ...props
}) {
  const Component = href ? "a" : "button";
  return (
    <Component
      {...(href ? { href } : { type: "button" })}
      {...props}
      className={`button button-${variant} ${className}`}
    >
      {children}
      {icon && <Icon name={icon} size={18} />}
    </Component>
  );
}
