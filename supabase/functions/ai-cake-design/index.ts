// AI cake mockup generator/editor using Lovable AI Gateway (Nano Banana)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  prompt: string;
  imageUrl?: string; // optional reference image (data: or https)
  lang?: "ar" | "en";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, imageUrl, lang = "ar" } = (await req.json()) as Body;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
    if (!prompt || prompt.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Prompt too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const styled =
      `Hyper-realistic 3D rendered luxury cake on a marble pedestal, ` +
      `Saudi-inspired ornament with subtle sadu geometric patterns and edible gold leaf, ` +
      `studio lighting, cream background, editorial bakery photography. ` +
      `Customer brief (${lang}): ${prompt}`;

    const userContent: any[] = [{ type: "text", text: styled }];
    if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: userContent }],
        modalities: ["image", "text"],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("AI gateway error", r.status, text);
      if (r.status === 429)
        return new Response(JSON.stringify({ error: "تم تجاوز الحد. حاول لاحقاً." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (r.status === 402)
        return new Response(
          JSON.stringify({ error: "نفاد الرصيد. أضف رصيد لمواصلة التوليد." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    console.log("AI gateway response", JSON.stringify(data).slice(0, 1000));
    const msg = data.choices?.[0]?.message;
    const generated = msg?.images?.[0]?.image_url?.url;
    if (!generated) {
      const reason = msg?.content || "قد يكون الطلب يخالف سياسات المحتوى (مثل شخصيات محمية بحقوق الملكية). جرّب وصفًا مختلفًا.";
      return new Response(
        JSON.stringify({ error: typeof reason === "string" ? reason : "لم يتم توليد صورة" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ image: generated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-cake-design error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
