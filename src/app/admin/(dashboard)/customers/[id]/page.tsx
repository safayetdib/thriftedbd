import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { getCustomerById } from "@/lib/services/customer.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCustomerAction } from "./actions";
import type { ICustomerAddress } from "@/models/Customer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-hairline rounded-none border bg-white p-5">
      <h2 className="text-eyebrow text-caption-sm text-mute mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default async function AdminCustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  await connectDB();
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/customers"
        className="text-charcoal hover:text-ink-900 text-body-sm-strong flex items-center gap-1.5"
      >
        <ArrowLeftIcon size={14} /> Back to customers
      </Link>

      <h1 className="text-ink-900 text-heading-lg">{customer.name}</h1>

      {error && (
        <p className="border-sale-500 bg-sale-50 text-sale-700 text-body-sm rounded-none border px-4 py-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Profile">
          <form action={updateCustomerAction.bind(null, id)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email (read-only)</Label>
              <Input id="email" value={customer.email} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={customer.name} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={customer.phone} required />
            </div>
            <Button type="submit" variant="primary" size="sm" className="w-fit">
              Save changes
            </Button>
          </form>
        </Section>

        <Section title="Addresses">
          {customer.addresses.length === 0 ? (
            <p className="text-mute text-body-sm">No saved addresses.</p>
          ) : (
            <ul className="text-body-sm flex flex-col gap-3">
              {customer.addresses.map((address: ICustomerAddress, i: number) => (
                <li key={i} className="border-hairline-soft border-b pb-2 last:border-0">
                  <p className="text-ink-900 text-body-sm-strong">
                    {address.label} {address.isDefault && "(default)"}
                  </p>
                  <p className="text-charcoal">
                    {address.address}, {address.city}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Favorites">
          <p className="text-charcoal text-body-sm">
            {customer.favoriteProductIds.length} saved product(s)
          </p>
        </Section>

        <Section title="Account">
          <dl className="text-body-sm flex flex-col gap-2">
            <div className="flex justify-between">
              <dt className="text-mute">Joined</dt>
              <dd className="text-ink-900 text-body-sm-strong">
                {new Date(customer.createdAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Last updated</dt>
              <dd className="text-ink-900 text-body-sm-strong">
                {new Date(customer.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Section>
      </div>
    </div>
  );
}
