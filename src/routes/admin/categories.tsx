import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

type Category = Tables<"categories">;

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function CategoriesPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (cat: TablesInsert<"categories">) => {
      if (editing) {
        const { error } = await supabase
          .from("categories")
          .update({
            name_ar: cat.name_ar,
            name_en: cat.name_en,
            slug: cat.slug,
            image_url: cat.image_url,
            sort_order: cat.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(cat);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success(editing ? "تم تعديل الصنف" : "تم إضافة الصنف");
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("تم حذف الصنف");
    },
    onError: (e) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">إدارة الأصناف</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(v) => {
            setDialogOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="me-2 h-4 w-4" />
              إضافة صنف
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>{editing ? "تعديل صنف" : "إضافة صنف جديد"}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              initial={editing}
              loading={upsert.isPending}
              onSubmit={(v) => upsert.mutate(v)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          لا توجد أصناف بعد. أضف أول صنف الآن!
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">الاسم (عربي)</th>
                <th className="px-4 py-3 text-start font-medium">الاسم (إنجليزي)</th>
                <th className="px-4 py-3 text-start font-medium">Slug</th>
                <th className="px-4 py-3 text-start font-medium">الترتيب</th>
                <th className="px-4 py-3 text-end font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{cat.name_ar}</td>
                  <td className="px-4 py-3">{cat.name_en}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
                            remove.mutate(cat.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoryForm({
  initial,
  loading,
  onSubmit,
}: {
  initial: Category | null;
  loading: boolean;
  onSubmit: (v: TablesInsert<"categories">) => void;
}) {
  const [nameAr, setNameAr] = useState(initial?.name_ar ?? "");
  const [nameEn, setNameEn] = useState(initial?.name_en ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name_ar: nameAr,
      name_en: nameEn,
      slug: slug || slugify(nameEn),
      image_url: imageUrl || null,
      sort_order: sortOrder,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>الاسم بالعربي</Label>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>الاسم بالإنجليزي</Label>
          <Input
            value={nameEn}
            onChange={(e) => {
              setNameEn(e.target.value);
              if (!initial) setSlug(slugify(e.target.value));
            }}
            required
            dir="ltr"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            dir="ltr"
            placeholder="auto-generated"
          />
        </div>
        <div className="space-y-2">
          <Label>الترتيب</Label>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>رابط الصورة (اختياري)</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          dir="ltr"
          placeholder="https://..."
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            إلغاء
          </Button>
        </DialogClose>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {initial ? "حفظ التعديلات" : "إضافة"}
        </Button>
      </div>
    </form>
  );
}
