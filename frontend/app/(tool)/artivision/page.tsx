import { Header } from "@/components/layout/Header";
import { ArtiVisionHome } from "@/components/artivision/ArtiVisionHome";

export const metadata = { title: "ArtiVision — Outil chantier" };

export default function ArtiVisionPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen overflow-hidden pb-16 pt-24 grad-mesh">
        <div className="container">
          <ArtiVisionHome />
        </div>
      </main>
    </>
  );
}
