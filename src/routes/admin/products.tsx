import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

type Product = Tables<"products">;
type Category = Tables<"categories">;

function ProductsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (prod: TablesInsert<"products">) => {
      if (editing) {
        const { error } = await supabase
          .from("products")
          .update({
            name_ar: prod.name_ar,
            name_en: prod.name_en,
            desc_ar: prod.desc_ar,
            desc_en: prod.desc_en,
            price: prod.price,
            category_id: prod.category_id,
            image_url: prod.image_url,
            is_active: prod.is_active,
            sort_order: prod.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(prod);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success(editing ? "تم تعديل المنتج" : "تم إضافة المنتج");
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("تم حذف المنتج");
    },
    onError: (e) => toast.error(e.message),
  });

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">إدارة المنتجات</h1>
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
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "تعديل منتج" : "إضافة منتج جديد"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              initial={editing}
              categories={categories}
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
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          لا توجد منتجات بعد. أضف أول منتج الآن!
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">المنتج</th>
                <th className="px-4 py-3 text-start font-medium">الصنف</th>
                <th className="px-4 py-3 text-start font-medium">السعر</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-end font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.name_ar}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{p.name_ar}</p>
                        <p className="text-xs text-muted-foreground">{p.name_en}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.category_id ? (catMap.get(p.category_id)?.name_ar ?? "—") : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {Number(p.price).toLocaleString("ar-SA")} ر.س
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "نشط" : "معطل"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                            remove.mutate(p.id);
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

function ProductForm({
  initial,
  categories,
  loading,
  onSubmit,
}: {
  initial: Product | null;
  categories: Category[];
  loading: boolean;
  onSubmit: (v: TablesInsert<"products">) => void;
}) {
  const [nameAr, setNameAr] = useState(initial?.name_ar ?? "");
  const [nameEn, setNameEn] = useState(initial?.name_en ?? "");
  const [descAr, setDescAr] = useState(initial?.desc_ar ?? "");
  const [descEn, setDescEn] = useState(initial?.desc_en ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name_ar: nameAr,
      name_en: nameEn,
      desc_ar: descAr || null,
      desc_en: descEn || null,
      price,
      category_id: categoryId || null,
      image_url: imageUrl || null,
      is_active: isActive,
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
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required dir="ltr" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>الوصف بالعربي</Label>
          <Textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={2} />
        </div>
        <div className="space-y-2">
          <Label>الوصف بالإنجليزي</Label>
          <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} dir="ltr" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>السعر (ر.س)</Label>
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label>الصنف</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر صنف" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <Label>رابط الصورة</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          dir="ltr"
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={isActive} onCheckedChange={setIsActive} />
        <Label>منتج نشط</Label>
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
