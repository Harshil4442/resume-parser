import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "AI Resume CoPilot",
  description: "Parse resumes, match JDs, learn skill gaps, and prep interviews.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Nav />
        <div className="px-4">{children}</div>
      </body>
    </html>
  );
}
