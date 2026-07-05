/**
 * Full database seeder — fetches product images from SceneSku APIs, maps them
 * to products, and inserts all collections into MongoDB.
 *
 * Usage:
 *   1. Ensure MONGODB_URI is set in .env.local
 *   2. pnpm tsx scripts/seed-full.ts
 *
 * This DROPS all existing data first, then recreates it.
 * Passwords for all users/customers: "password123"
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── Dummy data ────────────────────────────────────────────────────────────
import {
  owners as rawOwners,
  colors as rawColors,
  categories as rawCategories,
  products as rawProducts,
  users as rawUsers,
  customers as rawCustomers,
  carts as rawCarts,
  orders as rawOrders,
  settings as rawSettings,
  transactions as rawTransactions,
  blacklist as rawBlacklist,
  coupons as rawCoupons,
  promotions as rawPromotions,
  subscribers as rawSubscribers,
} from "./dummy-data";

import Owner from "../src/models/Owner";
import Color from "../src/models/Color";
import Category from "../src/models/Category";
import Product from "../src/models/Product";
import User from "../src/models/User";
import Customer from "../src/models/Customer";
import Cart from "../src/models/Cart";
import Order from "../src/models/Order";
import Settings from "../src/models/Settings";
import Transaction from "../src/models/Transaction";
import Blacklist from "../src/models/Blacklist";
import Coupon from "../src/models/Coupon";
import Promotion from "../src/models/Promotion";
import Subscriber from "../src/models/Subscriber";

// ─── ID mapping ────────────────────────────────────────────────────────────
// The dummy data uses readable string IDs. Convert them to real ObjectIds.

const _idMap = new Map<string, mongoose.Types.ObjectId>();

function id(key: string): mongoose.Types.ObjectId {
  if (!_idMap.has(key)) {
    _idMap.set(key, new mongoose.Types.ObjectId());
  }
  return _idMap.get(key)!;
}

function remapIds<T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]): T {
  const copy = { ...obj };
  for (const field of fields) {
    const val = copy[field];
    if (typeof val === "string") {
      copy[field] = id(val) as T[keyof T];
    }
  }
  return copy;
}

function replaceId<T extends { _id: string }>(doc: T): T & { _id: mongoose.Types.ObjectId } {
  return { ...doc, _id: id(doc._id) };
}

// ─── SceneSku API endpoints ────────────────────────────────────────────────

const API_URLS = [
  "https://scenesku.com/api/v1/public-packs/womens-fashion",
  "https://scenesku.com/api/v1/public-packs/home-decor",
  "https://scenesku.com/api/v1/public-packs/shoes",
];

interface SceneSkuImage {
  image_url: string;
}

interface SceneSkuPack {
  images: SceneSkuImage[];
  categories: { slug: string }[];
}

interface SceneSkuResponse {
  data: SceneSkuPack[];
}

async function fetchImagesByCategory(): Promise<Map<string, string[]>> {
  const responses = await Promise.all(
    API_URLS.map((url) => fetch(url).then((r) => r.json() as unknown as SceneSkuResponse)),
  );

  const map = new Map<string, string[]>();

  for (const res of responses) {
    for (const pack of res.data) {
      for (const cat of pack.categories) {
        const urls = pack.images.map((img) => img.image_url);
        const existing = map.get(cat.slug) ?? [];
        existing.push(...urls);
        map.set(cat.slug, existing);
      }
    }
  }

  return map;
}

function assignImagesToProducts(prods: typeof rawProducts, imageMap: Map<string, string[]>) {
  const womensImages = imageMap.get("womens-fashion") ?? [];
  const homeImages = imageMap.get("home-decor") ?? [];
  const shoesImages = imageMap.get("shoes") ?? [];

  let wi = 0,
    hi = 0,
    si = 0;

  return prods.map((p) => {
    const isWomen = p.categoryId.startsWith("cat-women");
    const isHouse = p.categoryId.startsWith("cat-house");
    const pool = isWomen ? womensImages : isHouse ? homeImages : shoesImages;
    const idx = isWomen ? wi++ : isHouse ? hi++ : si++;
    const size = pool.length;

    const firstUrl = pool[idx % size];
    const secondUrl = pool[(idx + 1) % size];

    return {
      ...p,
      images: [
        {
          url: firstUrl,
          key: `scenesku/${firstUrl.split("/").pop() ?? "img"}`,
          alt: { en: `${p.title.en} — front view` },
          order: 0,
        },
        {
          url: secondUrl,
          key: `scenesku/${secondUrl.split("/").pop() ?? "img"}`,
          alt: { en: `${p.title.en} — alternate view` },
          order: 1,
        },
      ],
    };
  });
}

// ─── Seed logic ────────────────────────────────────────────────────────────

async function seed() {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI in .env.local");
  }

  await mongoose.connect(mongodbUri);
  console.log("Connected to MongoDB.\n");

  // ── Drop all existing data ──
  const existingCollections = await mongoose.connection.db?.listCollections().toArray();
  for (const col of existingCollections ?? []) {
    await mongoose.connection.db?.dropCollection(col.name);
  }
  console.log("Dropped all existing collections.\n");

  // ── Fetch images from SceneSku ──
  console.log("Fetching images from SceneSku…");
  const imageMap = await fetchImagesByCategory();
  const totalImages = [...imageMap.values()].reduce((s, a) => s + a.length, 0);
  console.log(`Fetched ${totalImages} images across ${imageMap.size} categories.\n`);

  const productsWithImages = assignImagesToProducts(rawProducts, imageMap);

  // ─── 1. Owners ───
  const ownerDocs = rawOwners.map(replaceId);
  await Owner.insertMany(ownerDocs);
  console.log(`1/14 Owners — ${ownerDocs.length}`);

  // ─── 2. Colors ───
  const colorDocs = rawColors.map(replaceId);
  await Color.insertMany(colorDocs);
  console.log(`2/14 Colors — ${colorDocs.length}`);

  // ─── 3. Categories (build parentId refs) ───
  const categoryDocs = rawCategories.map((c) => ({
    ...replaceId(c),
    parentId: c.parentId ? id(c.parentId) : null,
  }));
  await Category.insertMany(categoryDocs);
  console.log(`3/14 Categories — ${categoryDocs.length}`);

  // ─── 4. Products (build refs to categories, colors, owners) ───
  const productDocs = productsWithImages.map((p) => ({
    ...p,
    _id: id(p._id),
    categoryId: id(p.categoryId),
    colorId: id(p.colorId),
    ownerId: id(p.ownerId),
  }));
  await Product.insertMany(productDocs);
  console.log(`4/14 Products — ${productDocs.length}`);

  // ─── 5. Admin user ───
  const passwordHash = await bcrypt.hash("password123", 12);
  await User.create({ ...replaceId(rawUsers[0]), passwordHash });
  console.log("5/14 Admin user — 1");

  // ─── 6. Customers ───
  const customerDocs = await Promise.all(
    rawCustomers.map(async (c) => ({
      ...replaceId(c),
      passwordHash: await bcrypt.hash("password123", 12),
      favoriteProductIds: (c.favoriteProductIds ?? []).map((fp: string) => id(fp)),
    })),
  );
  await Customer.insertMany(customerDocs);
  console.log(`6/14 Customers — ${customerDocs.length}`);

  // ─── 7. Carts ───
  const cartDocs = rawCarts.map((c) => ({
    ...replaceId(c),
    customerId: c.customerId ? id(c.customerId) : undefined,
    items: c.items.map((item) => ({
      ...item,
      productId: id(item.productId as string),
    })),
  }));
  await Cart.insertMany(cartDocs);
  console.log(`7/14 Carts — ${cartDocs.length}`);

  // ─── 8. Orders ───
  const orderDocs = rawOrders.map((o) => ({
    ...o,
    _id: id(o._id),
    customerId: o.customerId ? id(o.customerId as string) : undefined,
    items: o.items.map((item) => ({
      ...item,
      productId: id(item.productId as string),
      ownerId: id(item.ownerId as string),
    })),
    statusHistory: o.statusHistory.map((sh) => {
      const changedBy = (sh as { changedBy?: unknown }).changedBy;
      return {
        ...sh,
        changedBy: typeof changedBy === "string" ? id(changedBy) : undefined,
      };
    }),
    confirmationCall: {
      ...o.confirmationCall,
      calledBy: (() => {
        const calledBy = (o.confirmationCall as { calledBy?: unknown }).calledBy;
        return typeof calledBy === "string" ? id(calledBy) : undefined;
      })(),
    },
  }));
  await Order.insertMany(orderDocs);
  console.log(`8/14 Orders — ${orderDocs.length}`);

  // ─── 9. Settings ───
  const settingsDoc = {
    ...rawSettings,
    _id: id("settings-singleton"),
    homepage: rawSettings.homepage
      ? {
          ...rawSettings.homepage,
          featuredProductIds: (rawSettings.homepage.featuredProductIds ?? []).map((fp: string) =>
            id(fp),
          ),
          featuredCategoryIds: (rawSettings.homepage.featuredCategoryIds ?? []).map((fc: string) =>
            id(fc),
          ),
        }
      : undefined,
  };
  await Settings.create(settingsDoc);
  console.log("9/14 Settings — singleton");

  // ─── 10. Transactions ───
  const txnDocs = rawTransactions.map((t) => ({
    ...t,
    _id: id(t._id),
    recordedBy: id(t.recordedBy as string),
    orderIds: (t.orderIds as string[]).map((oid) => id(oid)),
  }));
  await Transaction.insertMany(txnDocs);
  console.log(`10/14 Transactions — ${txnDocs.length}`);

  // ─── 11. Blacklist ───
  const blDocs = rawBlacklist.map((b) => ({
    ...b,
    _id: id(b._id),
    addedBy: id(b.addedBy as string),
    relatedOrderIds: (b.relatedOrderIds as string[]).map((oid) => id(oid)),
  }));
  await Blacklist.insertMany(blDocs);
  console.log(`11/14 Blacklist — ${blDocs.length}`);

  // ─── 12. Coupons ───
  const couponDocs = rawCoupons.map(replaceId);
  await Coupon.insertMany(couponDocs);
  console.log(`12/14 Coupons — ${couponDocs.length}`);

  // ─── 13. Promotions ───
  const promoDocs = rawPromotions.map(replaceId);
  await Promotion.insertMany(promoDocs);
  console.log(`13/14 Promotions — ${promoDocs.length}`);

  // ─── 14. Subscribers ───
  await Subscriber.insertMany(rawSubscribers);
  console.log(`14/14 Subscribers — ${rawSubscribers.length}`);

  await mongoose.connection.close();
  console.log("\n✅ Seed complete. All 14 collections populated.");
}

seed()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
