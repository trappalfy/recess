import type { Metadata } from "next";
import { MarketView } from "@/components/app/MarketView";
import { RECESS_CONFIG } from "@/lib/recess/config";

type Props = { params: Promise<{ ticker: string }> };

const normalise = (raw: string) => decodeURIComponent(raw).toUpperCase();

/**
 * The configured tickers prerender, so the app stays a static frontend. Any
 * other ticker still renders and reports that it has no market this weekend.
 */
export function generateStaticParams() {
  return RECESS_CONFIG.tickers.map((ticker) => ({ ticker }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  return { title: normalise(ticker) };
}

export default async function MarketPage({ params }: Props) {
  const { ticker } = await params;
  return <MarketView ticker={normalise(ticker)} />;
}
