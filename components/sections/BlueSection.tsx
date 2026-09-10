/**
 * Main brief 6.3. One blue block carries Solution, Showcase, CTA and the
 * footer, and is itself an artboard so objects near its edges can use --u.
 */
export function BlueSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="artboard-wrap" data-testid="blue-section">
      <div className="artboard blue-section overflow-hidden">
        <div className="grain blue-grain" />
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}
