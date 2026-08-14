export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6 text-center">
        About Mon Ours
      </h1>

      <div className="space-y-6 text-ink/70 leading-relaxed">
        <p>
          Mon Ours started with a simple idea: the best pastries usually don't
          come from big chains — they come from someone's home kitchen, a small
          neighborhood bakery, or a baker who's still building their name. We
          wanted a place where those bakers could be found.
        </p>

        <p>
          Every shop on Mon Ours is run by an independent baker who sets their
          own prices, bakes their own daily batches, and ships their own orders.
          When you order here, you're ordering directly from the person who made
          it — not a warehouse, not a franchise.
        </p>

        <p>
          "Today's Bake" is at the heart of how we think about freshness: rather
          than endless stock sitting on a shelf, bakers list what they're
          actually making that day, in the quantity they're actually making it.
          When it's gone, it's gone — until tomorrow's batch.
        </p>

        <p>
          Whether you're here to find your new favorite croissant or to open
          your own shop and share what you bake, welcome to Mon Ours.
        </p>
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <a
          href="/products"
          className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition"
        >
          Browse Pastries
        </a>

        <a
          href="/register"
          className="border border-ink/15 text-ink px-6 py-3 rounded-full font-medium hover:bg-ink/5 transition"
        >
          Become a Seller
        </a>
      </div>
    </div>
  );
}
