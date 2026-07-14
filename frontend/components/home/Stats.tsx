export default function Stats() {
  const stats = [
    { number: "15K+", label: "Players" },
    { number: "900+", label: "Matches Hosted" },
    { number: "₹5L+", label: "Prize Pool" },
  ];

  return (
    <section className="bg-black py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center"
          >
            <h2 className="text-4xl font-bold text-yellow-500">
              {item.number}
            </h2>
            <p className="mt-3 text-zinc-400">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}