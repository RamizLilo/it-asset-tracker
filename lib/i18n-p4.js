// Texts for login and the database (live mode)
export default {
  en: {
    "login.title": "Sign in", "login.sub": "Sign in to open the asset database of your company.", "login.email": "E-mail", "login.password": "Password", "login.name": "Your name", "login.signin": "Sign in", "login.signup": "Create account",
    "login.toSignup": "No account yet? Create one", "login.toSignin": "Already have an account? Sign in", "login.checkMail": "Account created. If e-mail confirmation is on, confirm your address first, then sign in.", "login.firstAdmin": "The first account that is created becomes administrator. Everyone after that starts as viewer.",
    "login.error": "Sign-in failed: {msg}", "login.short": "Use at least 6 characters for the password.", logout: "Sign out",
    "db.error": "Could not save to the database ({msg}). The data was reloaded from the database.", "db.live": "Live mode: data is stored in the Supabase database and shared by all users.", "db.demo": "Demo mode: data is stored in this browser only.", "db.noProfile": "No profile was found for this login. Run supabase/schema.sql first, then create the account again.", "db.loadError": "Could not load data: {msg}",
    "users.title": "Users and roles", "users.sub": "New accounts start as viewer. Only an admin can change roles.", "users.name": "Name", "users.role": "Role", "users.saved": "Role updated", "users.you": "you",
    "set.liveWarn": "This changes the shared database for everyone.",
  },
  de: {
    "login.title": "Anmelden", "login.sub": "Melden Sie sich an, um die Gerätedatenbank Ihrer Firma zu öffnen.", "login.email": "E-Mail", "login.password": "Passwort", "login.name": "Ihr Name", "login.signin": "Anmelden", "login.signup": "Konto erstellen",
    "login.toSignup": "Noch kein Konto? Konto erstellen", "login.toSignin": "Schon ein Konto? Anmelden", "login.checkMail": "Konto erstellt. Falls die E-Mail-Bestätigung aktiv ist, bestätigen Sie zuerst Ihre Adresse und melden sich dann an.", "login.firstAdmin": "Das erste erstellte Konto wird Administrator. Alle weiteren beginnen als Leser.",
    "login.error": "Anmeldung fehlgeschlagen: {msg}", "login.short": "Das Passwort braucht mindestens 6 Zeichen.", logout: "Abmelden",
    "db.error": "Speichern in der Datenbank nicht möglich ({msg}). Die Daten wurden neu aus der Datenbank geladen.", "db.live": "Live-Modus: Die Daten liegen in der Supabase-Datenbank und werden von allen Nutzern geteilt.", "db.demo": "Demo-Modus: Die Daten liegen nur in diesem Browser.", "db.noProfile": "Für diesen Login wurde kein Profil gefunden. Führen Sie zuerst supabase/schema.sql aus und erstellen Sie das Konto dann erneut.", "db.loadError": "Daten konnten nicht geladen werden: {msg}",
    "users.title": "Benutzer und Rollen", "users.sub": "Neue Konten beginnen als Leser. Nur ein Administrator kann Rollen ändern.", "users.name": "Name", "users.role": "Rolle", "users.saved": "Rolle geändert", "users.you": "Sie",
    "set.liveWarn": "Das ändert die gemeinsame Datenbank für alle.",
  },
};
