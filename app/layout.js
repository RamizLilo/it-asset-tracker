import "./globals.css";
import { AppProvider } from "@/lib/store";
import Shell from "@/components/Shell";

export const metadata = { title: { default: "IT Asset Tracker", template: "%s | IT Asset Tracker" }, description: "Track company devices, who has them, warranties and maintenance." };

// sets the saved theme before the page paints, so there is no flash
const themeScript = `try{var d=JSON.parse(localStorage.getItem("itam-data-v1")||"null");if(d&&d.settings&&d.settings.theme)document.documentElement.setAttribute("data-theme",d.settings.theme)}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><AppProvider><Shell>{children}</Shell></AppProvider></body>
    </html>
  );
}
