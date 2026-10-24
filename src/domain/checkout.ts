export type CheckoutInput = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type CheckoutValidation =
  | { ok: true; value: Required<Omit<CheckoutInput, "email">> & { email?: string } }
  | { ok: false; errors: Record<string, string> };

const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trim(value: string | undefined): string {
  return (value ?? "").trim();
}

export function validateCheckout(input: CheckoutInput): CheckoutValidation {
  const errors: Record<string, string> = {};
  const name = trim(input.name);
  const phone = trim(input.phone).replace(/\s+/g, "");
  const email = trim(input.email);
  const address = trim(input.address);
  const city = trim(input.city);
  const state = trim(input.state);
  const pincode = trim(input.pincode);

  if (name.length < 2) errors.name = "Enter your full name";
  if (!PHONE_RE.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number";
  if (email && !EMAIL_RE.test(email)) errors.email = "Enter a valid email or leave blank";
  if (address.length < 8) errors.address = "Enter a complete delivery address";
  if (city.length < 2) errors.city = "Enter city";
  if (state.length < 2) errors.state = "Enter state";
  if (!PINCODE_RE.test(pincode)) errors.pincode = "Enter a 6-digit pincode";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      phone,
      email: email || undefined,
      address,
      city,
      state,
      pincode,
    },
  };
}
