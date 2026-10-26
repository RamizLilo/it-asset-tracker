const assets = [
  { id: "AST-001", name: 'MacBook Pro 16"', type: "Laptop", user: "J. Smith", status: "Active", maintenance: "2026-11-15" },
  { id: "AST-002", name: "Dell UltraSharp 27", type: "Monitor", user: "M. Rossi", status: "Active", maintenance: "2027-01-20" },
  { id: "AST-003", name: "PowerEdge R740", type: "Server", user: "Infrastructure", status: "Maintenance", maintenance: "2026-10-28" },
  { id: "AST-004", name: "ThinkPad T14", type: "Laptop", user: "Unassigned", status: "In Stock", maintenance: "N/A" },
  { id: "AST-005", name: "Cisco Catalyst Switch", type: "Network", user: "Network Team", status: "Active", maintenance: "2026-12-05" },
];

export default function AssetTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Asset ID</th>
            <th className="py-3 px-4">Device Name</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Assigned To</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Next Service</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-mono text-xs text-blue-400">{asset.id}</td>
              <td className="py-3 px-4 font-medium text-white">{asset.name}</td>
              <td className="py-3 px-4 text-slate-400">{asset.type}</td>
              <td className="py-3 px-4 text-slate-300">{asset.user}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  asset.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  asset.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {asset.status}
                </span>
              </td>
              <td className="py-3 px-4 text-xs font-mono text-slate-400">{asset.maintenance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}