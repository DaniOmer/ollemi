import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
}
