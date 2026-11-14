import '@fontsource-variable/geist/wght.css';
import '../../styles/globals.css';

export const metadata = { title: '100 Hours of Agentic AI' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="tone-night">{children}</body>
    </html>
  );
}
