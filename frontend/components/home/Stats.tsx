export default function Stats() {
  const stats = [
    { number: "15K+", label: "Players" },
    { number: "900+", label: "Matches Hosted" },
    { number: "₹5L+", label: "Prize Pool Paid" },
  ];

  return (
    <section className="border-b border-border bg-panel py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px bg-border md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="bg-panel p-8 text-center">
            <h2 className="font-mono text-4xl font-semibold text-ember">
              {item.number}
            </h2>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}