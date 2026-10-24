// Columns used for exports (CSV) and for the asset import template
export const assetColumns = (t, byId, fmt) => [
  { key: "tag", label: "tag", get: (a) => a.tag }, { key: "name", label: "name", get: (a) => a.name }, { key: "category", label: "category", get: (a) => a.category },
  { key: "manufacturer", label: "manufacturer", get: (a) => a.manufacturer }, { key: "model", label: "model", get: (a) => a.model }, { key: "serial", label: "serial", get: (a) => a.serial },
  { key: "status", label: "status", get: (a) => a.status }, { key: "condition", label: "condition", get: (a) => a.condition },
  { key: "assignee", label: "assignee", get: (a) => byId.emp[a.assigneeId]?.name || "" }, { key: "location", label: "location", get: (a) => byId.loc[a.locationId]?.name || "" },
  { key: "vendor", label: "vendor", get: (a) => byId.vendor[a.vendorId]?.name || "" }, { key: "purchaseDate", label: "purchaseDate", get: (a) => a.purchaseDate || "" },
  { key: "price", label: "price", get: (a) => a.price ?? "" }, { key: "warrantyEnd", label: "warrantyEnd", get: (a) => a.warrantyEnd || "" }, { key: "invoice", label: "invoice", get: (a) => a.invoice || "" }, { key: "notes", label: "notes", get: (a) => a.notes || "" },
];
