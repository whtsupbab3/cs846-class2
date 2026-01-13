import "./globals.css";

export const metadata = {
  title: "Microblog",
  description: "Share short-form posts and thoughts"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
