import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "./Header";
import { CartProvider } from "@/components/cart/CartProvider";

describe("Header", () => {
  it("renders brand and primary navigation", () => {
    render(
      <CartProvider>
        <Header />
      </CartProvider>,
    );
    expect(screen.getByText("Aone Beauty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Offers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Bag/i })).toBeInTheDocument();
  });
});
