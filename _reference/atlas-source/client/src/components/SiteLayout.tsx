import Nav from "./Nav";
import Footer from "./Footer";
import AIConciergeWidget from "./AIConciergeWidget";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <AIConciergeWidget />
    </div>
  );
}
