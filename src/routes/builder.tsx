import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CakeBuilder } from "@/components/site/CakeBuilder";

export const Route = createFileRoute("/builder")({
  component: BuilderPage,
  head: () => ({
    meta: [
      { title: "صمم كعكتك — كريزي كيك" },
      { name: "description", content: "محرر كعك تفاعلي: اختر الحجم، الطبقات، النكهة والزخرفة السعودية." },
    ],
  }),
});

function BuilderPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <CakeBuilder />
      </main>
      <Footer />
    </div>
  );
}
