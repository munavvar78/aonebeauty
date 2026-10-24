/** All money values are integer paise. Never use floats. */

export type Paise = number;

export function assertPaise(value: number, label = "amount"): Paise {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer number of paise`);
  }
  if (value < 0) {
    throw new Error(`${label} cannot be negative`);
  }
  return value;
}

export function lineTotalPaise(unitPricePaise: Paise, quantity: number): Paise {
  assertPaise(unitPricePaise, "unitPricePaise");
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("quantity must be a non-negative integer");
  }
  return unitPricePaise * quantity;
}

export function sumPaise(amounts: Paise[]): Paise {
  return amounts.reduce((sum, amount) => {
    assertPaise(amount);
    return sum + amount;
  }, 0);
}

/** Convert rupees (e.g. 170 or 170.5) to integer paise for storage. */
export function rupeesToPaise(rupees: number, label = "amount"): Paise {
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new Error(`${label} must be a non-negative number of rupees`);
  }
  return assertPaise(Math.round(rupees * 100), label);
}

/** Convert stored paise to rupees for form defaults. */
export function paiseToRupees(paise: Paise): number {
  assertPaise(paise);
  return paise / 100;
}

/** Format paise as Indian Rupees for display only. */
export function formatInr(paise: Paise): string {
  assertPaise(paise);
  const rupees = paiseToRupees(paise);
  const hasPaise = paise % 100 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}
