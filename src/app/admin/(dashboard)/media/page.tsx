import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlassIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { getMediaLibrary } from "@/lib/services/media.service";
import { connectDB } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admin/pagination";
import { ConfirmableForm } from "@/components/admin/confirmable-form";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteMediaAction } from "./actions";

function fileName(key: string) {
  return key.split("/").pop() ?? key;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const page = Number(params.page) || 1;

  await connectDB();
  const { items, total, usedCount, orphanCount, limit } = await getMediaLibrary({
    page,
    limit: 24,
    search: q,
    sort,
  });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const sortHref = (value: "newest" | "oldest") => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    sp.set("sort", value);
    return `/admin/media?${sp.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink-900 text-heading-lg">Media library</h1>
          <p className="text-mute text-caption-sm mt-0.5">
            {total} images · {usedCount} in use · {orphanCount} unused
          </p>
        </div>
      </div>

      {/* Search + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form action="/admin/media" method="get" className="relative flex-1 md:max-w-sm">
          <MagnifyingGlassIcon
            size={16}
            className="text-mute pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          />
          <input type="hidden" name="sort" value={sort} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by filename…"
            className="bg-soft-cloud focus-visible:border-ink-900 text-body-sm rounded-pill h-11 w-full border border-transparent pr-4 pl-10 outline-none focus-visible:bg-white"
          />
        </form>
        <div className="flex gap-2">
          {(["newest", "oldest"] as const).map((value) => (
            <Link
              key={value}
              href={sortHref(value)}
              className={`text-caption-sm text-eyebrow rounded-pill border px-4 py-1.5 transition-colors ${
                sort === value
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-hairline text-charcoal hover:bg-soft-cloud bg-white"
              }`}
            >
              {value === "newest" ? "Newest" : "Oldest"}
            </Link>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<MagnifyingGlassIcon size={32} />} title="No images found." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.key}
              className="border-hairline flex flex-col rounded-none border bg-white"
            >
              <div className="bg-soft-cloud relative aspect-square overflow-hidden">
                <Image src={item.url} alt="" fill unoptimized className="object-cover" />
                {item.inUse ? (
                  <span className="absolute top-2 left-2">
                    <Badge className="text-ink-900 bg-white">In use</Badge>
                  </span>
                ) : (
                  <span className="absolute top-2 right-2">
                    <ConfirmableForm
                      action={deleteMediaAction.bind(null, item.key)}
                      title={`Delete "${fileName(item.key)}"?`}
                      description="This permanently removes the image from R2 storage. This cannot be undone."
                      confirmLabel="Delete"
                      confirmVariant="destructive"
                    >
                      <Button type="submit" variant="outline" size="icon-sm">
                        <TrashIcon size={14} />
                      </Button>
                    </ConfirmableForm>
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 p-2">
                <p className="text-caption-sm text-ink-900 truncate" title={fileName(item.key)}>
                  {fileName(item.key)}
                </p>
                <p className="text-mute text-caption-sm">
                  {new Date(item.lastModified).toLocaleDateString()} · {formatSize(item.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/media"
        params={{ q, sort }}
      />
    </div>
  );
}
