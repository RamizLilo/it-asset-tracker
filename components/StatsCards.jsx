export default function StatsCards() {
  const stats = [
    { title: "Total Assets", value: "142", subtext: "+12 this month", color: "text-blue-400" },
    { title: "Assigned Devices", value: "118", subtext: "83% utilization", color: "text-emerald-400" },
    { title: "Pending Maintenance", value: "5", subtext: "Requires attention", color: "text-amber-400" },
    { title: "Total Value", value: "€184,500", subtext: "Hardware capital", color: "text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
}