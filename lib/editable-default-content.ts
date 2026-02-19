import type { EditableContent } from "@/types";

export const defaultEditableContent: EditableContent = {
  hero: {
    title: "Welcome to Our Platform",
    subtitle: "Build amazing things with our tools",
    image: "",
  },
  features: {
    title: "Features",
    items: [
      {
        title: "Feature 1",
        description: "Description of feature 1",
        image: "",
      },
      {
        title: "Feature 2",
        description: "Description of feature 2",
        image: "",
      },
      {
        title: "Feature 3",
        description: "Description of feature 3",
        image: "",
      },
    ],
  },
  testimonials: {
    title: "Testimonials",
    items: [
      {
        name: "John Doe",
        text: "Great product!",
        image: "",
      },
      {
        name: "Jane Smith",
        text: "Highly recommended!",
        image: "",
      },
    ],
  },
};
