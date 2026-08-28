import VirtualLab from "@/components/VirtualLab";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: 'Virtual Laboratoriya | Sanotaf Edu',
  description: 'Biologiya fanidan interaktiv virtual laboratoriyalar',
};

export default function VirtualLabPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-6 pt-32 w-full">
        <VirtualLab />
      </div>
      <Footer />
    </main>
  );
}
