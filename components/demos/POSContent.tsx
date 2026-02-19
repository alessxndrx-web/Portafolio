"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/design";
import { StaggerContainer, StaggerItem } from "@/lib/motion";
import type { CartItem, Product, Sale } from "@/types";

type ProductCategory = "all" | "food" | "drinks" | "office" | "tech";
type ProductLeafCategory = Exclude<ProductCategory, "all">;
type SalesFilter = "all" | "today" | "week";
type POSTab = "products" | "sales";

type CheckoutSnapshot = {
  sale: Sale;
  previousProducts: Product[];
  previousCart: CartItem[];
};

const LOW_STOCK_THRESHOLD = 5;

const defaultProducts: Product[] = [
  { id: "1", name: "Latte", price: 4.5, stock: 40, category: "drinks" },
  { id: "2", name: "Notebook", price: 7.99, stock: 25, category: "office" },
  { id: "3", name: "Wireless Mouse", price: 19.99, stock: 18, category: "tech" },
  { id: "4", name: "Sandwich", price: 8.75, stock: 22, category: "food" },
];

function inferCategory(name: string): ProductLeafCategory {
  const value = name.toLowerCase();
  if (value.includes("coffee") || value.includes("juice") || value.includes("latte") || value.includes("drink")) {
    return "drinks";
  }
  if (value.includes("book") || value.includes("note") || value.includes("pen") || value.includes("paper")) {
    return "office";
  }
  if (value.includes("phone") || value.includes("mouse") || value.includes("keyboard") || value.includes("tech")) {
    return "tech";
  }
  return "food";
}

export function POSContent() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [products, setProducts] = useLocalStorage<Product[]>("pos_products", defaultProducts);
  const [sales, setSales] = useLocalStorage<Sale[]>("pos_sales", []);

  const [activeTab, setActiveTab] = useLocalStorage<POSTab>("ui_pos_active_tab", "products");
  const [category, setCategory] = useLocalStorage<ProductCategory>("ui_pos_category_filter", "all");
  const [salesFilter, setSalesFilter] = useLocalStorage<SalesFilter>("ui_pos_sales_filter", "all");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [salesLoading, setSalesLoading] = useState(false);
  const [lastCheckout, setLastCheckout] = useState<CheckoutSnapshot | null>(null);

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "food" as ProductLeafCategory,
  });

  const [checkoutSuccessOpen, setCheckoutSuccessOpen] = useState(false);

  useEffect(() => {
    const tabs: POSTab[] = ["products", "sales"];
    if (!tabs.includes(activeTab)) {
      setActiveTab("products");
    }
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    const categories: ProductCategory[] = ["all", "food", "drinks", "office", "tech"];
    if (!categories.includes(category)) {
      setCategory("all");
    }
  }, [category, setCategory]);

  useEffect(() => {
    const filters: SalesFilter[] = ["all", "today", "week"];
    if (!filters.includes(salesFilter)) {
      setSalesFilter("all");
    }
  }, [salesFilter, setSalesFilter]);

  useEffect(() => {
    const requiresMigration = products.some((product) => !product.category);
    if (!requiresMigration) {
      return;
    }

    setProducts(
      products.map((product) => ({
        ...product,
        category: product.category ?? inferCategory(product.name),
      }))
    );
  }, [products, setProducts]);

  useEffect(() => {
    if (activeTab !== "sales") {
      return;
    }

    setSalesLoading(true);
    const timer = window.setTimeout(() => setSalesLoading(false), 520);
    return () => window.clearTimeout(timer);
  }, [activeTab, salesFilter]);

  const productCategories = [
    { id: "all" as const, label: t.pos.categoryAll },
    { id: "food" as const, label: t.pos.categoryFood },
    { id: "drinks" as const, label: t.pos.categoryDrinks },
    { id: "office" as const, label: t.pos.categoryOffice },
    { id: "tech" as const, label: t.pos.categoryTech },
  ];

  const categoryLabels: Record<ProductLeafCategory, string> = {
    food: t.pos.categoryFood,
    drinks: t.pos.categoryDrinks,
    office: t.pos.categoryOffice,
    tech: t.pos.categoryTech,
  };

  const stockByProductId = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((product) => map.set(product.id, product.stock));
    return map;
  }, [products]);

  const quantityByProductId = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => map.set(item.product.id, item.quantity));
    return map;
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "all" ? true : product.category === category;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, category, searchTerm]);

  const filteredSales = useMemo(() => {
    if (salesFilter === "all") {
      return sales;
    }

    const now = new Date();

    if (salesFilter === "today") {
      return sales.filter((sale) => new Date(sale.date).toDateString() === now.toDateString());
    }

    return sales.filter((sale) => {
      const saleDate = new Date(sale.date).getTime();
      const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      return saleDate >= weekAgo;
    });
  }, [sales, salesFilter]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", price: "", stock: "", category: "food" });
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category ?? inferCategory(product.name),
    });
    setProductDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.stock) {
      showToast(t.pos.fillAllFields, "error");
      return;
    }

    const nextProduct: Product = {
      id: editingProduct?.id ?? Math.random().toString(36).slice(2, 9),
      name: productForm.name,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      category: productForm.category,
    };

    if (editingProduct) {
      setProducts(products.map((product) => (product.id === editingProduct.id ? nextProduct : product)));
      showToast(t.pos.productUpdated, "success");
    } else {
      setProducts([nextProduct, ...products]);
      showToast(t.pos.productAdded, "success");
    }

    setProductDialogOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    showToast(t.pos.productDeleted, "success");
  };

  const handleAddToCart = (product: Product) => {
    const currentQty = quantityByProductId.get(product.id) ?? 0;
    const availableStock = stockByProductId.get(product.id) ?? 0;

    if (currentQty + 1 > availableStock) {
      showToast(t.pos.stockInsufficient, "error");
      return;
    }

    setCart((previous) => {
      const existing = previous.find((item) => item.product.id === product.id);
      if (existing) {
        return previous.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }
      return [...previous, { product, quantity: 1 }];
    });

    showToast(t.pos.addedToCart, "success");
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const availableStock = stockByProductId.get(productId) ?? 0;
    if (quantity > availableStock) {
      showToast(t.pos.stockInsufficient, "error");
      return;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    const removed = cart.find((item) => item.product.id === productId);
    if (!removed) {
      return;
    }

    setCart((previous) => previous.filter((item) => item.product.id !== productId));
    showToast(t.pos.removedFromCart, "error", {
      actionLabel: t.pos.undoRemove,
      onAction: () => {
        setCart((previous) => {
          const existing = previous.find((item) => item.product.id === removed.product.id);
          if (existing) {
            return previous.map((item) =>
              item.product.id === removed.product.id
                ? {
                    ...item,
                    quantity: item.quantity + removed.quantity,
                  }
                : item
            );
          }
          return [...previous, removed];
        });
      },
    });
  };

  const revertCheckout = (snapshot: CheckoutSnapshot) => {
    setProducts(snapshot.previousProducts);
    setSales((previous) => previous.filter((sale) => sale.id !== snapshot.sale.id));
    setCart(snapshot.previousCart);
    setLastCheckout(null);
    showToast(t.pos.checkoutReverted, "success");
  };

  const handleCheckout = () => {
    if (!cart.length) {
      showToast(t.pos.noItems, "error");
      return;
    }

    const insufficientStock = cart.find((item) => {
      const stock = stockByProductId.get(item.product.id) ?? 0;
      return item.quantity > stock;
    });

    if (insufficientStock) {
      showToast(t.pos.stockInsufficient, "error");
      return;
    }

    const previousProducts = [...products];
    const previousCart = [...cart];

    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.product.id === product.id);
      if (!cartItem) {
        return product;
      }

      return {
        ...product,
        stock: Math.max(product.stock - cartItem.quantity, 0),
      };
    });

    const newSale: Sale = {
      id: Math.random().toString(36).slice(2, 9),
      items: [...cart],
      total: cartTotal,
      date: new Date().toISOString(),
    };

    const lowStockProducts = updatedProducts.filter((product) => product.stock <= LOW_STOCK_THRESHOLD);

    setProducts(updatedProducts);
    setSales([newSale, ...sales]);
    setCart([]);
    setCheckoutSuccessOpen(true);

    const snapshot: CheckoutSnapshot = {
      sale: newSale,
      previousProducts,
      previousCart,
    };

    setLastCheckout(snapshot);
    showToast(t.pos.orderComplete, "success", {
      actionLabel: t.pos.checkoutUndo,
      onAction: () => revertCheckout(snapshot),
    });

    if (lowStockProducts.length > 0) {
      const names = lowStockProducts.map((product) => product.name).join(", ");
      showToast(`${t.pos.stockLowWarning}: ${names}`, "error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{t.pos.title}</h1>
          <p className="text-sm text-muted-foreground">{t.pos.checkoutSuccessDesc}</p>
        </div>
        <Button className="gap-2" onClick={() => setCartOpen(true)} data-testid="pos-open-cart">
          <ShoppingCart className="h-4 w-4" />
          {t.pos.openCart}
          <Badge className="ml-1 bg-white/25 text-primary-foreground" variant="outline">
            {cart.length}
          </Badge>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as POSTab)}>
        <TabsList>
          <TabsTrigger value="products">{t.pos.products}</TabsTrigger>
          <TabsTrigger value="sales">{t.pos.salesHistory}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card className="rounded-2xl border-border/70">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                  <label htmlFor="pos-search" className="sr-only">
                    {t.pos.searchPlaceholder}
                  </label>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pos-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-9"
                    placeholder={t.pos.searchPlaceholder}
                    data-testid="pos-search-input"
                  />
                </div>
                <Button className="gap-2" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4" />
                  {t.pos.addProduct}
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {productCategories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    aria-pressed={category === item.id}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      category === item.id
                        ? "border-primary/35 bg-primary/15 text-primary"
                        : "border-border/80 bg-secondary/35 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Search}
              title={t.pos.productNoMatch}
              description={t.pos.searchPlaceholder}
              actionLabel={t.common.cancel}
              onAction={() => {
                setSearchTerm("");
                setCategory("all");
              }}
            />
          ) : (
            <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const selectedQty = quantityByProductId.get(product.id) ?? 0;
                const canAdd = selectedQty < product.stock;
                const isLowStock = product.stock <= LOW_STOCK_THRESHOLD;

                return (
                  <StaggerItem key={product.id}>
                    <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <Card className="group h-full rounded-2xl border-border/70">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle>{product.name}</CardTitle>
                              <CardDescription>
                                ${product.price.toFixed(2)} • {t.pos.stock}: {product.stock}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              {isLowStock ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                  <AlertTriangle className="h-3 w-3" />
                                  {t.pos.stockLowWarning}
                                </span>
                              ) : null}
                              <Badge variant="secondary">{categoryLabels[product.category ?? "food"]}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" size="sm" onClick={() => handleEditProduct(product)}>
                              {t.dashboard.usersTable.edit}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                              {t.dashboard.usersTable.delete}
                            </Button>
                            <Button
                              size="sm"
                              className="ml-auto"
                              onClick={() => handleAddToCart(product)}
                              disabled={!canAdd}
                              data-testid={`pos-add-${product.id}`}
                            >
                              {t.pos.addToCart}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card className="rounded-2xl border-border/70">
            <CardHeader>
              <CardTitle>{t.pos.salesHistory}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { id: "all" as const, label: t.pos.salesFilterAll },
                  { id: "today" as const, label: t.pos.salesFilterToday },
                  { id: "week" as const, label: t.pos.salesFilterWeek },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSalesFilter(item.id)}
                    aria-pressed={salesFilter === item.id}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      salesFilter === item.id
                        ? "border-primary/35 bg-primary/15 text-primary"
                        : "border-border/80 bg-secondary/35 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {salesLoading ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t.pos.salesLoading}</p>
                  <div className="h-10 animate-pulse rounded bg-secondary/55" />
                  <div className="h-10 animate-pulse rounded bg-secondary/55" />
                  <div className="h-10 animate-pulse rounded bg-secondary/55" />
                </div>
              ) : filteredSales.length === 0 ? (
                <EmptyState icon={ShoppingCart} title={t.pos.salesNoData} description={t.common.noData} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.common.date}</TableHead>
                      <TableHead>{t.common.items}</TableHead>
                      <TableHead>{t.pos.total}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                        <TableCell>{sale.items.length}</TableCell>
                        <TableCell>${sale.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {cartOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border/70 bg-background/95 p-4 shadow-2xl backdrop-blur-xl"
              role="dialog"
              aria-label={t.pos.cartDrawerTitle}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t.pos.cartDrawerTitle}</h2>
                <Button variant="ghost" size="icon" onClick={() => setCartOpen(false)} aria-label={t.pos.closeCart}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {cart.length === 0 ? (
                <EmptyState icon={ShoppingCart} title={t.pos.noItems} description={t.common.noData} />
              ) : (
                <>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                      {cart.map((item) => (
                        <motion.div
                          layout
                          key={item.product.id}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border border-border/70 bg-card/80 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">${item.product.price.toFixed(2)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromCart(item.product.id)}
                              aria-label={t.pos.remove}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="min-w-7 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <p className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 border-t border-border/70 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{t.pos.total}</p>
                      <p className="text-xl font-semibold">${cartTotal.toFixed(2)}</p>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                      data-testid="pos-checkout-button"
                    >
                      {t.pos.completeOrder}
                    </Button>
                  </div>
                </>
              )}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent onClose={() => setProductDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingProduct ? t.pos.editProduct : t.pos.addProduct}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="pos-product-name" className="mb-1.5 block text-sm font-medium">
                {t.pos.productName}
              </label>
              <Input
                id="pos-product-name"
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="pos-product-price" className="mb-1.5 block text-sm font-medium">
                  {t.pos.price}
                </label>
                <Input
                  id="pos-product-price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                />
              </div>
              <div>
                <label htmlFor="pos-product-stock" className="mb-1.5 block text-sm font-medium">
                  {t.pos.stock}
                </label>
                <Input
                  id="pos-product-stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="pos-product-category" className="mb-1.5 block text-sm font-medium">
                {t.pos.categoryLabel}
              </label>
              <select
                id="pos-product-category"
                value={productForm.category}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    category: event.target.value as ProductLeafCategory,
                  })
                }
                className="flex h-10 w-full rounded-xl border border-input/90 bg-background/75 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {productCategories
                  .filter((item) => item.id !== "all")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
              </select>
            </div>
            <Button className="w-full" onClick={handleSaveProduct}>
              {t.common.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutSuccessOpen} onOpenChange={setCheckoutSuccessOpen}>
        <DialogContent onClose={() => setCheckoutSuccessOpen(false)}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 12 }).map((_, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: -6, x: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [0, 34], x: [(index % 2 === 0 ? -1 : 1) * (10 + index)] }}
                  transition={{ duration: 0.7, delay: index * 0.04 }}
                  className="absolute left-1/2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
              ))}
            </div>
            <div className="relative z-10 flex items-center gap-3" data-testid="pos-success-modal">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold">{t.pos.checkoutSuccessTitle}</p>
                <p className="text-sm text-muted-foreground">{t.pos.checkoutSuccessDesc}</p>
              </div>
            </div>
            {lastCheckout ? (
              <div className="relative z-10 mt-3">
                <Button variant="secondary" size="sm" onClick={() => revertCheckout(lastCheckout)}>
                  {t.pos.checkoutUndo}
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
