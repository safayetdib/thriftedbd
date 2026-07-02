import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-eyebrow text-ink-500">404</p>
      <h1 className="text-ink-900 mt-2 text-3xl font-extrabold">Page not found</h1>
      <p className="text-ink-600 mt-3 max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/products">
          <Button variant="primary">Browse products</Button>
        </Link>
        <Link href="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
    </main>
  );
}
