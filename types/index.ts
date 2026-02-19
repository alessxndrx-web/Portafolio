export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: "food" | "drinks" | "office" | "tech";
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Sale = {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
};

export type EditableContent = {
  hero: {
    title: string;
    subtitle: string;
    image?: string;
  };
  features: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      image?: string;
    }>;
  };
  testimonials: {
    title: string;
    items: Array<{
      name: string;
      text: string;
      image?: string;
    }>;
  };
};

export type EditableContentWorkspace = {
  draft: EditableContent;
  published: EditableContent;
  lastSavedAt: string | null;
  lastPublishedAt: string | null;
};
