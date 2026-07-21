export function CornerFrame({
  tone = "ember",
  show = "hover",
}: {
  tone?: "ember" | "cyan";
  show?: "hover" | "always";
}) {
  const color = tone === "cyan" ? "var(--tac-cyan)" : "var(--ember)";
  const vis =
    show === "always"
      ? "opacity-100"
      : "opacity-0 group-hover:opacity-100 transition-opacity duration-300";

  const base = `pointer-events-none absolute h-4 w-4 ${vis}`;

  return (
    <>
      <span
        className={`${base} -top-px -left-px border-l-2 border-t-2`}
        style={{ borderColor: color }}
      />
      <span
        className={`${base} -top-px -right-px border-r-2 border-t-2`}
        style={{ borderColor: color }}
      />
      <span
        className={`${base} -bottom-px -left-px border-l-2 border-b-2`}
        style={{ borderColor: color }}
      />
      <span
        className={`${base} -bottom-px -right-px border-r-2 border-b-2`}
        style={{ borderColor: color }}
      />
    </>
  );
}