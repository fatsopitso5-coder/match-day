import "./globals.css";

export const metadata = {
  title: "MatchDay",
  description: "Social football competitions, fixtures and live match stats"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
