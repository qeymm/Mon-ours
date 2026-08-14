const steps = [
  {
    emoji: "🔍",
    title: "Browse",
    description:
      "Explore pastries from independent bakers near you — daily drops, custom cakes, everyday favorites.",
  },
  {
    emoji: "🛒",
    title: "Order",
    description:
      "Add items from one or several shops to your cart, then check out in a few taps.",
  },
  {
    emoji: "📦",
    title: "Enjoy",
    description:
      "Track your order from pending to delivered, straight from the baker to your door.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-background py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="font-display text-2xl font-semibold text-ink text-center mb-10">
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3">{step.emoji}</div>
              <h3 className="font-display font-semibold text-ink mb-2">
                {i + 1}. {step.title}
              </h3>
              <p className="text-ink/60 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
