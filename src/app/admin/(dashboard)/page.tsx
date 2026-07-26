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
    },
    {
      href: "/admin/products?status=ACTIVE",
      label: "Active products",
      value: stats.activeProducts,
      icon: TagIcon,
    },
    {
      href: "/admin/customers",
      label: "Customers",
      value: stats.customers,
      icon: UsersIcon,
    },
    {
      href: "/admin/transactions?status=PENDING",
      label: "Unreconciled transactions",
      value: stats.pendingTransactions,
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-ink-900 text-heading-lg">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, label, value, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="border-hairline hover:border-ink-900 flex flex-col gap-3 rounded-none border bg-white p-5 transition-colors"
          >
            <div className="bg-soft-cloud text-ink-900 flex size-10 items-center justify-center rounded-none">
              <Icon size={20} />
            </div>
            <p className="text-ink-900 text-price text-heading-xl">{value}</p>
            <p className="text-eyebrow text-caption-sm text-mute">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
