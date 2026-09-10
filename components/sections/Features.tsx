import { Badge } from "@/components/ui/Badge";
import { BlurWords } from "@/components/ui/BlurWords";
import { Reveal } from "@/components/ui/Reveal";
import { Card1 } from "@/components/features/Card1";
import { Card2 } from "@/components/features/Card2";
import { Card3 } from "@/components/features/Card3";
import { Card4 } from "@/components/features/Card4";
import { COPY } from "@/lib/copy";

/** Main brief 6.2: 150px above, 140px below, two bento rows with a 20px gap. */
export function Features() {
  return (
    <section className="pt-[150px] pb-[140px]">
      <div className="container-recess">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <Badge variant="light" text={COPY.features.badge} />
          </Reveal>
          <BlurWords
            as="h2"
            text={COPY.features.h2}
            data-testid="features-h2"
            className="mt-5 text-ink"
            style={{
              fontFamily: "var(--font-jakarta)",
              fontWeight: 500,
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.1,
            }}
          />
          <Reveal delay={0.1}>
            <p
              className="mt-7 text-body"
              style={{ fontFamily: "var(--font-inter)", fontSize: 18, lineHeight: 1.4 }}
            >
              {COPY.features.lead}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-[740fr_548fr]">
          <Card1 />
          <Card2 />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[497fr_791fr]">
          <Card3 />
          <Card4 />
        </div>
      </div>
    </section>
  );
}
