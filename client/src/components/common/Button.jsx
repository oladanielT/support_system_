export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  disabled,
}) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
