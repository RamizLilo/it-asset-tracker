// Texts, English and German. A missing German text falls back to English.
const en = {
  brand: "IT Asset Tracker", soon: "This page is planned and will be built next (see docs/TODO.md).", shortcuts: "Ctrl+K search · g then a/d/e/m/l/r jump",
  "nav.dashboard": "Dashboard", "nav.assets": "Assets", "nav.employees": "Employees", "nav.locations": "Locations", "nav.vendors": "Vendors", "nav.maintenance": "Maintenance",
  "nav.licenses": "Licenses", "nav.consumables": "Consumables", "nav.labels": "QR labels", "nav.reports": "Reports", "nav.activity": "Activity log", "nav.settings": "Settings",
  "search.placeholder": "Search assets, people, pages…", "palette.title": "Command palette", "palette.pages": "Pages", "palette.actions": "Actions", "palette.none": "Nothing found",
  "role.label": "Role", "role.admin": "Admin", "role.technician": "Technician", "role.viewer": "Viewer", denied: "Your role does not allow this action.", "theme.toggle": "Switch light/dark theme",
  "alerts.title": "Alerts", "alerts.none": "No alerts. Everything is in order.", "alerts.warranty": "Warranty ending soon", "alerts.maintenance": "Maintenance due", "alerts.stock": "Low stock", "alerts.licenses": "Licenses ending", "alerts.leavers": "Devices with people who left",
  cancel: "Cancel", confirm: "Confirm", save: "Save", edit: "Edit", delete: "Delete", duplicate: "Duplicate", reset: "Reset", apply: "Apply", back: "Back", choose: "Choose…", none: "None", print: "Print", viewAll: "View all", filters: "Filters", columns: "Columns", view: "View", "view.table": "Table view", "view.grid": "Card view", actions: "Actions", days: "{n} days", years: "{n} years", exportCsv: "Export CSV", noResults: "No results.", expand: "Show details",
  "pager.range": "{from}–{to} of {total}", "pager.rows": "Rows", "pager.prev": "Previous page", "pager.next": "Next page",
  "status.in_use": "In use", "status.in_stock": "In stock", "status.in_repair": "In repair", "status.retired": "Retired", "status.lost": "Lost", "status.scheduled": "Scheduled", "status.in_progress": "In progress", "status.done": "Done",
  "cat.laptop": "Laptop", "cat.desktop": "Desktop", "cat.monitor": "Monitor", "cat.phone": "Phone", "cat.tablet": "Tablet", "cat.printer": "Printer", "cat.network": "Network", "cat.server": "Server", "cat.peripheral": "Peripheral", "cat.other": "Other",
  "cond.new": "New", "cond.good": "Good", "cond.fair": "Fair", "cond.poor": "Poor",
  "mtype.repair": "Repair", "mtype.preventive": "Preventive", "mtype.inspection": "Inspection", "mtype.upgrade": "Upgrade",
  "w.ok": "Valid", "w.soon": "Ending soon", "w.expired": "Expired", "w.none": "No warranty", "w.soonIn": "Warranty ends in {n} days",
  "f.name": "Name", "f.category": "Category", "f.tag": "Asset tag", "f.tagHint": "Leave empty to generate one", "f.manufacturer": "Manufacturer", "f.model": "Model", "f.serial": "Serial number", "f.invoice": "Invoice no.",
  "f.status": "Status", "f.condition": "Condition", "f.assignee": "Assigned to", "f.location": "Location", "f.vendor": "Vendor", "f.price": "Price", "f.purchaseDate": "Purchase date", "f.warrantyEnd": "Warranty ends", "f.warranty": "Warranty",
  "f.maintEvery": "Service every (days)", "f.maintHint": "0 = no regular service", "f.notes": "Notes", "f.note": "Note",
  "col.tag": "Tag", "col.name": "Name", "col.category": "Category", "col.status": "Status", "col.assignee": "Assigned to", "col.location": "Location", "col.vendor": "Vendor", "col.purchase": "Purchased", "col.price": "Price", "col.book": "Book value", "col.warranty": "Warranty", "col.condition": "Condition", "col.serial": "Serial",
  "err.required": "Required", "err.number": "Enter a number of 0 or more", "err.future": "Date cannot be in the future", "err.warranty": "Warranty cannot end before the purchase", "err.inUse": "An asset in use needs a user or a location",
  "err.inuse": "Still in use, so it cannot be deleted.", "err.hasAssets": "This person still has devices. Check them in first.", "err.tag": "This asset tag already exists.", "err.seats": "No free seats left.", "err.email": "Enter a valid e-mail", "err.dupEmail": "E-mail already used", "err.dupName": "This name already exists", "err.seatsBelow": "{n} seats are already given out",
  "toast.saved": "Saved", "toast.created": "Created", "toast.deleted": "Deleted", "toast.duplicated": "Copy created", "toast.checkedOut": "Checked out", "toast.checkedIn": "Checked in", "toast.bulk": "{n} assets updated", "toast.done": "Marked as done",
  "assets.sub": "{n} assets in total", "assets.new": "New asset", "assets.edit": "Edit asset", "assets.search": "Search tag, name, serial, person…", "assets.exportCsv": "Export CSV", "assets.unassigned": "Unassigned", "assets.noMatch": "No asset matches these filters.", "assets.empty": "No assets yet.",
  "assets.checkout": "Check out", "assets.checkin": "Check in", "assets.returnTo": "Return to", "assets.defaultCols": "Default columns", "assets.deleteAsk": "Delete {n} asset(s)? This also removes their maintenance records.", "assets.notFound": "This asset does not exist (any more).",
  "bulk.selected": "{n} selected", "bulk.status": "Change status", "bulk.location": "Change location", "bulk.category": "Change category", "bulk.labels": "QR labels", "bulk.clear": "Clear selection", "bulk.all": "Select all on this page",
  "import.title": "Import CSV", "import.help": "Upload a CSV with at least the columns name and category. Dates as YYYY-MM-DD. People, locations and vendors are matched by name.", "import.choose": "Choose file", "import.template": "Download template", "import.paste": "…or paste CSV text here", "import.check": "Check data",
  "import.empty": "The file has no data rows.", "import.missing": "Missing column(s): {cols}", "import.line": "Line", "import.exists": "already exists", "import.valid": "{n} row(s) are valid.", "import.invalid": "{n} row(s) have problems and are skipped:", "import.run": "Import {n} row(s)", "import.done": "{n} assets imported",
  "detail.info": "Details", "detail.finance": "Purchase and value", "detail.age": "Age", "detail.book": "Book value now", "detail.curve": "Value over {n} years (straight line)", "detail.nextMaint": "Next service", "detail.noMaint": "No maintenance yet.", "detail.maintCost": "Maintenance cost so far", "detail.label": "QR label", "detail.history": "History", "detail.noHistory": "No history yet.",
  "labels.printLabel": "Print label",
  "maint.new": "New maintenance", "maint.edit": "Edit maintenance", "maint.asset": "Asset", "maint.title": "Title", "maint.type": "Type", "maint.due": "Due date", "maint.cost": "Cost", "maint.tech": "Technician", "maint.complete": "Mark done",
  "dash.sub": "Overview for {company}", "dash.find": "Quick find", "dash.total": "Active assets", "dash.totalHint": "{n} retired or lost", "dash.overdue": "{n} overdue", "dash.value": "Purchase value", "dash.book": "Book value", "dash.bookHint": "Straight line, {n} years",
  "dash.byStatus": "Assets by status", "dash.byCategory": "Assets by category", "dash.spend": "Purchases per year", "dash.none": "Nothing to show.",
  "act.stocktake": "Stocktake", "act.create": "Created", "act.update": "Updated", "act.delete": "Deleted", "act.bulk": "Bulk change", "act.checkout": "Checked out", "act.checkin": "Checked in", "act.import": "Imported", "act.complete": "Completed", "act.assign": "Seat assigned", "act.unassign": "Seat removed", "act.stock": "Stock changed",
  "emp.sub": "{n} active employees", "emp.new": "New employee", "emp.edit": "Edit employee", "emp.search": "Search name, e-mail, title…", "emp.dept": "Department", "emp.title": "Job title", "emp.devices": "Devices", "emp.noDevices": "No devices assigned.", "emp.active": "Active", "emp.left": "Left", "emp.deleteAsk": "Delete {name}?",
  "settings.resetDone": "Demo data restored", "settings.clearDone": "All data cleared",
};

const de = {
  soon: "Diese Seite ist geplant und wird als Nächstes gebaut (siehe docs/TODO.md).", shortcuts: "Strg+K Suche · g dann a/d/e/m/l/r springt",
  "nav.dashboard": "Übersicht", "nav.assets": "Geräte", "nav.employees": "Mitarbeitende", "nav.locations": "Standorte", "nav.vendors": "Lieferanten", "nav.maintenance": "Wartung",
  "nav.licenses": "Lizenzen", "nav.consumables": "Verbrauchsmaterial", "nav.labels": "QR-Etiketten", "nav.reports": "Berichte", "nav.activity": "Aktivitätsprotokoll", "nav.settings": "Einstellungen",
  "search.placeholder": "Geräte, Personen, Seiten suchen…", "palette.title": "Befehlspalette", "palette.pages": "Seiten", "palette.actions": "Aktionen", "palette.none": "Nichts gefunden",
  "role.label": "Rolle", "role.admin": "Administrator", "role.technician": "Techniker", "role.viewer": "Leser", denied: "Ihre Rolle erlaubt diese Aktion nicht.", "theme.toggle": "Hell/Dunkel wechseln",
  "alerts.title": "Hinweise", "alerts.none": "Keine Hinweise. Alles in Ordnung.", "alerts.warranty": "Garantie läuft bald ab", "alerts.maintenance": "Wartung fällig", "alerts.stock": "Niedriger Bestand", "alerts.licenses": "Lizenzen laufen aus", "alerts.leavers": "Geräte bei ausgeschiedenen Personen",
  cancel: "Abbrechen", confirm: "Bestätigen", save: "Speichern", edit: "Bearbeiten", delete: "Löschen", duplicate: "Duplizieren", reset: "Zurücksetzen", apply: "Anwenden", back: "Zurück", choose: "Auswählen…", none: "Keine", print: "Drucken", viewAll: "Alle anzeigen", filters: "Filter", columns: "Spalten", view: "Ansicht", "view.table": "Tabellenansicht", "view.grid": "Kartenansicht", actions: "Aktionen", days: "{n} Tage", years: "{n} Jahre", exportCsv: "CSV exportieren", noResults: "Keine Ergebnisse.", expand: "Details anzeigen",
  "pager.range": "{from}–{to} von {total}", "pager.rows": "Zeilen", "pager.prev": "Vorherige Seite", "pager.next": "Nächste Seite",
  "status.in_use": "In Benutzung", "status.in_stock": "Auf Lager", "status.in_repair": "In Reparatur", "status.retired": "Ausgemustert", "status.lost": "Verloren", "status.scheduled": "Geplant", "status.in_progress": "In Arbeit", "status.done": "Erledigt",
  "cat.laptop": "Laptop", "cat.desktop": "Desktop-PC", "cat.monitor": "Monitor", "cat.phone": "Smartphone", "cat.tablet": "Tablet", "cat.printer": "Drucker", "cat.network": "Netzwerk", "cat.server": "Server", "cat.peripheral": "Zubehör", "cat.other": "Sonstiges",
  "cond.new": "Neu", "cond.good": "Gut", "cond.fair": "Akzeptabel", "cond.poor": "Schlecht",
  "mtype.repair": "Reparatur", "mtype.preventive": "Vorbeugend", "mtype.inspection": "Prüfung", "mtype.upgrade": "Aufrüstung",
  "w.ok": "Gültig", "w.soon": "Läuft bald ab", "w.expired": "Abgelaufen", "w.none": "Keine Garantie", "w.soonIn": "Garantie endet in {n} Tagen",
  "f.name": "Name", "f.category": "Kategorie", "f.tag": "Inventarnummer", "f.tagHint": "Leer lassen, um eine zu erzeugen", "f.manufacturer": "Hersteller", "f.model": "Modell", "f.serial": "Seriennummer", "f.invoice": "Rechnungsnr.",
  "f.status": "Status", "f.condition": "Zustand", "f.assignee": "Zugewiesen an", "f.location": "Standort", "f.vendor": "Lieferant", "f.price": "Preis", "f.purchaseDate": "Kaufdatum", "f.warrantyEnd": "Garantie bis", "f.warranty": "Garantie",
  "f.maintEvery": "Wartung alle (Tage)", "f.maintHint": "0 = keine regelmäßige Wartung", "f.notes": "Notizen", "f.note": "Notiz",
  "col.tag": "Nr.", "col.name": "Name", "col.category": "Kategorie", "col.status": "Status", "col.assignee": "Zugewiesen an", "col.location": "Standort", "col.vendor": "Lieferant", "col.purchase": "Gekauft", "col.price": "Preis", "col.book": "Buchwert", "col.warranty": "Garantie", "col.condition": "Zustand", "col.serial": "Seriennr.",
  "err.required": "Pflichtfeld", "err.number": "Zahl ab 0 eingeben", "err.future": "Datum darf nicht in der Zukunft liegen", "err.warranty": "Garantie kann nicht vor dem Kauf enden", "err.inUse": "Ein Gerät in Benutzung braucht eine Person oder einen Standort",
  "err.inuse": "Wird noch verwendet und kann nicht gelöscht werden.", "err.hasAssets": "Diese Person hat noch Geräte. Bitte zuerst zurücknehmen.", "err.tag": "Diese Inventarnummer gibt es schon.", "err.seats": "Keine freien Plätze mehr.", "err.email": "Gültige E-Mail eingeben", "err.dupEmail": "E-Mail bereits vergeben", "err.dupName": "Dieser Name existiert bereits", "err.seatsBelow": "{n} Plätze sind bereits vergeben",
  "toast.saved": "Gespeichert", "toast.created": "Angelegt", "toast.deleted": "Gelöscht", "toast.duplicated": "Kopie angelegt", "toast.checkedOut": "Ausgegeben", "toast.checkedIn": "Zurückgenommen", "toast.bulk": "{n} Geräte aktualisiert", "toast.done": "Als erledigt markiert",
  "assets.sub": "{n} Geräte insgesamt", "assets.new": "Neues Gerät", "assets.edit": "Gerät bearbeiten", "assets.search": "Nr., Name, Seriennr., Person suchen…", "assets.exportCsv": "CSV exportieren", "assets.unassigned": "Nicht zugewiesen", "assets.noMatch": "Kein Gerät passt zu diesen Filtern.", "assets.empty": "Noch keine Geräte.",
  "assets.checkout": "Ausgeben", "assets.checkin": "Zurücknehmen", "assets.returnTo": "Zurück an", "assets.defaultCols": "Standardspalten", "assets.deleteAsk": "{n} Gerät(e) löschen? Die Wartungseinträge werden ebenfalls entfernt.", "assets.notFound": "Dieses Gerät gibt es nicht (mehr).",
  "bulk.selected": "{n} ausgewählt", "bulk.status": "Status ändern", "bulk.location": "Standort ändern", "bulk.category": "Kategorie ändern", "bulk.labels": "QR-Etiketten", "bulk.clear": "Auswahl aufheben", "bulk.all": "Alle auf dieser Seite auswählen",
  "import.title": "CSV importieren", "import.help": "CSV mit mindestens den Spalten name und category hochladen. Datum als JJJJ-MM-TT. Personen, Standorte und Lieferanten werden über den Namen zugeordnet.", "import.choose": "Datei wählen", "import.template": "Vorlage laden", "import.paste": "…oder CSV-Text hier einfügen", "import.check": "Daten prüfen",
  "import.empty": "Die Datei enthält keine Datenzeilen.", "import.missing": "Fehlende Spalte(n): {cols}", "import.line": "Zeile", "import.exists": "existiert bereits", "import.valid": "{n} Zeile(n) sind gültig.", "import.invalid": "{n} Zeile(n) haben Probleme und werden übersprungen:", "import.run": "{n} Zeile(n) importieren", "import.done": "{n} Geräte importiert",
  "detail.info": "Details", "detail.finance": "Kauf und Wert", "detail.age": "Alter", "detail.book": "Buchwert heute", "detail.curve": "Wert über {n} Jahre (linear)", "detail.nextMaint": "Nächste Wartung", "detail.noMaint": "Noch keine Wartung.", "detail.maintCost": "Wartungskosten bisher", "detail.label": "QR-Etikett", "detail.history": "Verlauf", "detail.noHistory": "Noch kein Verlauf.",
  "labels.printLabel": "Etikett drucken",
  "maint.new": "Neue Wartung", "maint.edit": "Wartung bearbeiten", "maint.asset": "Gerät", "maint.title": "Titel", "maint.type": "Art", "maint.due": "Fällig am", "maint.cost": "Kosten", "maint.tech": "Techniker", "maint.complete": "Erledigt",
  "dash.sub": "Überblick für {company}", "dash.find": "Schnellsuche", "dash.total": "Aktive Geräte", "dash.totalHint": "{n} ausgemustert oder verloren", "dash.overdue": "{n} überfällig", "dash.value": "Anschaffungswert", "dash.book": "Buchwert", "dash.bookHint": "Linear, {n} Jahre",
  "dash.byStatus": "Geräte nach Status", "dash.byCategory": "Geräte nach Kategorie", "dash.spend": "Käufe pro Jahr", "dash.none": "Nichts anzuzeigen.",
  "act.stocktake": "Inventur", "act.create": "Angelegt", "act.update": "Geändert", "act.delete": "Gelöscht", "act.bulk": "Sammeländerung", "act.checkout": "Ausgegeben", "act.checkin": "Zurückgenommen", "act.import": "Importiert", "act.complete": "Abgeschlossen", "act.assign": "Lizenz zugewiesen", "act.unassign": "Lizenz entzogen", "act.stock": "Bestand geändert",
  "emp.sub": "{n} aktive Mitarbeitende", "emp.new": "Neue Person", "emp.edit": "Person bearbeiten", "emp.search": "Name, E-Mail, Funktion suchen…", "emp.dept": "Abteilung", "emp.title": "Funktion", "emp.devices": "Geräte", "emp.noDevices": "Keine Geräte zugewiesen.", "emp.active": "Aktiv", "emp.left": "Ausgeschieden", "emp.deleteAsk": "{name} löschen?",
  "settings.resetDone": "Demodaten wiederhergestellt", "settings.clearDone": "Alle Daten gelöscht",
};
import P1 from "./i18n-p1";
import P2 from "./i18n-p2";
import P3 from "./i18n-p3";
import P4 from "./i18n-p4";
import P5 from "./i18n-p5";
export const DICT = {
  en: { ...en, ...P1.en, ...P2.en, ...P3.en, ...P4.en, ...P5.en },
  de: { ...de, ...P1.de, ...P2.de, ...P3.de, ...P4.de, ...P5.de },
};

// Translate without the app state (used on the login screen)
export function translate(lang, key, vars) {
  let str = DICT[lang]?.[key] ?? DICT.en[key] ?? key;
  if (vars) for (const k in vars) str = str.replaceAll(`{${k}}`, vars[k]);
  return str;
}
