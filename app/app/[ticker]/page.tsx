import type { Metadata } from "next";
import { MarketView } from "@/components/app/MarketView";

type Props = { params: Promise<{ ticker: string }> };

const normalise = (raw: string) => decodeURIComponent(raw).toUpperCase();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  return { title: normalise(ticker) };
}

export default async function MarketPage({ params }: Props) {
  const { ticker } = await params;
  return <MarketView ticker={normalise(ticker)} />;
}
