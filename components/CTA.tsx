export default function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div className="bg-surface-highest rounded-[2rem] p-16 md:p-24 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl leading-[1] lowercase tracking-tighter mb-8 max-w-2xl mx-auto">
            ready to tend your digital garden?
          </h2>
          <p className="text-lg text-ink-variant max-w-xl mx-auto mb-12">
            Collect the best of the web in one place so the ideas worth keeping are always within
            reach.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="px-10 py-4 bg-primary-brand cursor-pointer text-white rounded-full font-medium hover:opacity-90 transition-all active:scale-95"
            >
              start your garden
            </button>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div className="absolute top-0 left-1/4 h-full w-[1px] bg-ink" />
          <div className="absolute top-0 right-1/4 h-full w-[1px] bg-ink" />
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-ink" />
        </div>
      </div>
    </section>
  );
}
