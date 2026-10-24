import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "./ProductCard";
import { CartProvider } from "@/components/cart/CartProvider";
import type { Product } from "@/data/products";

const base: Product = {
  id: "p-face-wash",
  slug: "gentle-face-wash",
  name: "Gentle Face Wash",
  description: "A soft daily face wash.",
  category: "skin",
  pricePaise: 17000,
  compareAtPricePaise: 29900,
  quantity: 50,
  lowStockThreshold: 5,
  featured: true,
  accentFrom: "#e8efe8",
  accentTo: "#8aa89a",
  isActive: true,
};

function renderCard(product: Product) {
  return render(
    <CartProvider>
      <ProductCard product={product} />
    </CartProvider>,
  );
}

describe("ProductCard", () => {
  it("shows sale price and MRP", () => {
    renderCard(base);
    expect(
      screen.getByRole("heading", { name: "Gentle Face Wash" }),
    ).toBeInTheDocument();
    expect(screen.getByText("₹170")).toBeInTheDocument();
    expect(screen.getByText("₹299")).toBeInTheDocument();
    expect(screen.getByText("Sale")).toBeInTheDocument();
    expect(screen.getByText("In stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("shows sold out state", () => {
    renderCard({ ...base, quantity: 0 });
    expect(screen.getAllByText("Sold out").length).toBeGreaterThan(0);
  });
});
