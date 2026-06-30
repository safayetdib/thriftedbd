import { connectDB } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSettingsAction } from "./actions";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-ink-900 flex flex-col gap-4 border-2 bg-white p-5">
      <h2 className="text-eyebrow text-ink-500">{title}</h2>
      {children}
    </div>
  );
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  await connectDB();
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-ink-900 text-2xl font-extrabold">Settings</h1>

      {error && (
        <p className="border-sale-500 bg-sale-50 text-sale-700 border-2 px-4 py-3 text-sm font-medium">
          {error}
        </p>
      )}

      <form action={updateSettingsAction} className="flex flex-col gap-6">
        <Section title="Delivery fee (৳)">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="insideDhaka">Inside Dhaka</Label>
              <Input
                id="insideDhaka"
                name="insideDhaka"
                type="number"
                min="0"
                defaultValue={settings.deliveryFee.insideDhaka}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="outsideDhaka">Outside Dhaka</Label>
              <Input
                id="outsideDhaka"
                name="outsideDhaka"
                type="number"
                min="0"
                defaultValue={settings.deliveryFee.outsideDhaka}
                required
              />
            </div>
          </div>
        </Section>

        <Section title="Store contact">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeContactPhone">Phone</Label>
              <Input
                id="storeContactPhone"
                name="storeContactPhone"
                defaultValue={settings.storeContact.phone}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeContactEmail">Email</Label>
              <Input
                id="storeContactEmail"
                name="storeContactEmail"
                type="email"
                defaultValue={settings.storeContact.email}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeContactAddress">Address</Label>
              <Input
                id="storeContactAddress"
                name="storeContactAddress"
                defaultValue={settings.storeContact.address}
                required
              />
            </div>
          </div>
        </Section>

        <Section title="Social links">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" name="facebook" defaultValue={settings.socialLinks.facebook} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                defaultValue={settings.socialLinks.instagram}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input id="tiktok" name="tiktok" defaultValue={settings.socialLinks.tiktok} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="youtube">YouTube</Label>
              <Input id="youtube" name="youtube" defaultValue={settings.socialLinks.youtube} />
            </div>
          </div>
        </Section>

        <Section title="Announcement bar">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="announcementEn">English</Label>
              <Input
                id="announcementEn"
                name="announcementEn"
                defaultValue={settings.announcement?.en}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="announcementBn">Bangla</Label>
              <Input
                id="announcementBn"
                name="announcementBn"
                defaultValue={settings.announcement?.bn}
              />
            </div>
          </div>
        </Section>

        <Section title="Risk thresholds">
          <div className="flex flex-col gap-1.5 sm:w-1/3">
            <Label htmlFor="largeOrderAmount">Large order amount (৳)</Label>
            <Input
              id="largeOrderAmount"
              name="largeOrderAmount"
              type="number"
              min="0"
              defaultValue={settings.riskThresholds.largeOrderAmount}
              required
            />
          </div>
        </Section>

        <Button type="submit" variant="primary" className="w-fit">
          Save settings
        </Button>
      </form>
    </div>
  );
}
