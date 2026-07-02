export const metadata = { title: "Returns & Refunds" };

export default function ReturnsPage() {
  return (
    <main className="max-w-container mx-auto px-4 py-12 md:px-8 md:py-16">
      <div className="max-w-2xl">
        <h1 className="text-ink-900 mb-6 text-3xl font-extrabold">Returns & Refunds</h1>

        <div className="prose prose-sm text-ink-700 max-w-none space-y-4">
          <p>
            We want you to be completely satisfied with your purchase. If you need to return an
            item, here&apos;s what you should know:
          </p>

          <section>
            <h2 className="text-ink-900 mt-6 mb-2 text-lg font-bold">30-Day Return Policy</h2>
            <p>
              All items can be returned within 30 days of delivery for a full refund of the purchase
              price (minus shipping fees in some cases).
            </p>
          </section>

          <section>
            <h2 className="text-ink-900 mt-6 mb-2 text-lg font-bold">Condition Requirements</h2>
            <ul className="ml-2 list-inside list-disc space-y-1">
              <li>Item must be in the same condition as received</li>
              <li>All original tags and packaging should be intact</li>
              <li>Item should not show signs of wear or damage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-ink-900 mt-6 mb-2 text-lg font-bold">How to Return</h2>
            <ol className="ml-2 list-inside list-decimal space-y-1">
              <li>Contact us with your order number</li>
              <li>Receive return instructions and shipping label</li>
              <li>Ship the item back to us</li>
              <li>Refund processed within 5-7 business days after we receive it</li>
            </ol>
          </section>

          <p className="mt-6">
            For more information or to initiate a return, contact us at{" "}
            <a href="/contact" className="font-semibold text-green-700">
              our contact page
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
