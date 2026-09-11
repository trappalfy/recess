import { FeatureGroups } from "@/components/showcase/FeatureGroups";

/** Main brief 6.4: the card sits about 110px below the Solution columns. */
export function Showcase() {
  return (
    <div className="container-recess pt-[110px]">
      <FeatureGroups />
    </div>
  );
}
