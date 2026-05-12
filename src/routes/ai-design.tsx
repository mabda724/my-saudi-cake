import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { AIDesigner } from "@/components/site/AIDesigner";

export const Route = createFileRoute("/ai-design")({
  component: AIPage,
  head: () => ({
    meta: [
      { title: "تصميم بالذكاء الاصطناعي — كريزي كيك" },
      { name: "description", content: "ولّد تصميم كعكتك عبر الذكاء الاصطناعي Nano Banana — صف، ارفع مرجع، واطلب." },
    ],
  }),
});

function AIPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <AIDesigner />
      </main>
      <Footer />
    </div>
  );
}
