// Validation for catalog data, used by the API and the admin page (not the customer site).
import { z } from 'zod';
import { KINDS } from './catalog.js';
import { PAYMENT_METHOD_IDS } from './order.js';

const centavos = z.number().int().min(0).max(10_000_000);

/** One choice inside an option group, e.g. "Iced" (+₱20) or "Oat milk" (+₱30). */
export const optionValueSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().trim().min(1).max(60),
  /** Added to the product price when picked. */
  delta: centavos.default(0),
});

/** A set of choices: Temperature (pick one), Add-ons (pick any), Size (pick one). */
export const optionGroupSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().trim().min(1).max(40),
  /** true: pick any number (add-ons); false: pick exactly one (size). */
  multi: z.boolean().default(false),
  values: z.array(optionValueSchema).min(1).max(20),
});

export const productInputSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]{2,60}$/, 'Use lowercase letters, numbers and dashes')
    .optional(),
  kind: z.enum(KINDS),
  /** Coffee: the menu group id from src/data/menu.ts. Others: free, for ordering. */
  category: z.string().trim().max(40).default(''),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).default(''),
  /** Coffee: the drink style ("Latte"). Thrift: size and measurements. */
  detail: z.string().trim().max(200).default(''),
  photoUrl: z.string().max(500).nullable().default(null),
  /** null until the price is set: shown as "Price at opening" and can't be ordered. */
  price: centavos.nullable().default(null),
  options: z.array(optionGroupSchema).max(6).default([]),
  /** null = no limit (coffee). Thrift pieces are 1. */
  stock: z.number().int().min(0).max(100_000).nullable().default(null),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  sort: z.number().int().default(0),
});
export type ProductInput = z.input<typeof productInputSchema>;
export type OptionGroup = z.infer<typeof optionGroupSchema>;
export type Product = Omit<z.infer<typeof productInputSchema>, 'id'> & { id: string };

export const deliverySettingsSchema = z.object({
  /** Where deliveries start (the shop). null until the address is set: delivery stays off. */
  origin: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable(),
  /** Furthest road distance we deliver, in km. */
  radiusKm: z.number().min(0.5).max(50),
  /** Fee for the first `baseKm`. */
  baseFee: centavos,
  baseKm: z.number().min(0).max(50),
  /** Added for each km (or part of one) past `baseKm`. */
  perKm: centavos,
});
export type DeliverySettings = z.infer<typeof deliverySettingsSchema>;

/** Which kinds take orders right now. Coffee stays off until opening day. */
export const orderingSettingsSchema = z.object({
  coffee: z.boolean(),
  shirt: z.boolean(),
  thrift: z.boolean(),
});
export type OrderingSettings = z.infer<typeof orderingSettingsSchema>;

/** Where customers send payment. Empty until set: ordering stays off. */
export const paymentSettingsSchema = z.object({
  /** The shop's GCash QR code image (uploaded in admin), or null. */
  gcashQrUrl: z.string().max(500).nullable().default(null),
  /** The shop's Maya QR Ph code image (uploaded in admin), or null. */
  qrUrl: z.string().max(500).nullable(),
});
export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;

export const settingsSchema = z.object({
  delivery: deliverySettingsSchema,
  ordering: orderingSettingsSchema,
  payment: paymentSettingsSchema,
});
export type Settings = z.infer<typeof settingsSchema>;

const latLng = { lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) };

export const quoteRequestSchema = z.object(latLng);

export const checkoutRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(60),
        quantity: z.number().int().min(1).max(20),
        choices: z.record(z.string().max(40), z.array(z.string().max(40)).max(20)),
      }),
    )
    .min(1, 'Your cart is empty')
    .max(30),
  customer: z.object({
    name: z.string().trim().min(2, 'Add your name').max(80),
    phone: z.string().trim().min(10, 'Add your mobile number').max(20),
    email: z.union([z.literal(''), z.string().trim().email('Check your email address').max(120)]).default(''),
  }),
  address: z.object({
    text: z.string().trim().min(5, 'Add your delivery address').max(300),
    ...latLng,
    notes: z.string().trim().max(300).default(''),
  }),
  paymentMethod: z.enum(PAYMENT_METHOD_IDS, { message: 'Choose how to pay' }),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
