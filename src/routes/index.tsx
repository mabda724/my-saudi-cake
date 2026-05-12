import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { ProductGrid } from "@/components/site/ProductGrid";
import { CakeBuilder } from "@/components/site/CakeBuilder";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "كريزي كيك — صمم كعكتك بالذكاء الاصطناعي" },
      { name: "description", content: "متجر سعودي للكعك والتورتة. صمم كعكتك ثلاثي الأبعاد أو عبر الذكاء الاصطناعي." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <ProductGrid />
        <CakeBuilder />
      </main>
      <Footer />
    </div>
  );
}
