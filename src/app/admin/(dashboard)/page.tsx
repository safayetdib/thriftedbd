import Link from "next/link";
import {
  PackageIcon,
  TagIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getAdminOrders } from "@/lib/services/order.service";
import { getAdminProducts } from "@/lib/services/product.service";
import { getCustomers } from "@/lib/services/customer.service";
import { getTransactions } from "@/lib/services/transaction.service";

async function getStats() {
  await connectDB();
  const [pendingOrders, activeProducts, customers, pendingTransactions] = await Promise.all([
    getAdminOrders({ status: "PENDING", limit: 1 }),
    getAdminProducts({ status: "ACTIVE", limit: 1 }),
    getCustomers({ limit: 1 }),
    getTransactions({ status: "PENDING", limit: 1 }),
  ]);
  return {
    pendingOrders: pendingOrders.total,
    activeProducts: activeProducts.total,
    customers: customers.total,
    pendingTransactions: pendingTransactions.total,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      href: "/admin/orders?status=PENDING",
      label: "Pending orders",
      value: stats.pendingOrders,
      icon: PackageIcon,
      accent: "bg-amber-400",
    },
    {
      href: "/admin/products?status=ACTIVE",
      label: "Active products",
      value: stats.activeProducts,
      icon: TagIcon,
      accent: "bg-green-500",
    },
    {
      href: "/admin/customers",
      label: "Customers",
      value: stats.customers,
      icon: UsersIcon,
      accent: "bg-denim-500",
    },
    {
      href: "/admin/transactions?status=PENDING",
      label: "Unreconciled transactions",
      value: stats.pendingTransactions,
      icon: CurrencyDollarIcon,
      accent: "bg-sale-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-ink-900 text-2xl font-extrabold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, label, value, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className="group border-ink-900 shadow-brutal-sm hover:shadow-brutal-md flex flex-col gap-3 border-2 bg-white p-5 transition-all"
          >
            <span
              className={`border-ink-900 flex size-10 items-center justify-center border-2 text-white ${accent}`}
            >
              <Icon size={20} weight="bold" />
            </span>
            <p className="text-ink-900 text-3xl font-extrabold">{value}</p>
            <p className="text-eyebrow text-ink-500">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
