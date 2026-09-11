"use client";

import { useEffect, useLayoutEffect, useRef, useState, type DependencyList } from "react";
import { getClient, type RecessClient } from "./client";

const REFRESH_MS = 60_000;

/**
 * Reads from the RecessClient and reads again whenever the client reports a
 * change, so a stake on one screen shows on every other without a reload. It
 * also refreshes each minute, because a market locks on the clock alone.
 */
export function useRecess<T>(
  load: (client: RecessClient) => Promise<T>,
  deps: DependencyList,
): { data: T | undefined; error: Error | null } {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const loadRef = useRef(load);

  useLayoutEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let alive = true;
    const client = getClient();
    const run = () =>
      loadRef.current(client).then(
        (value) => {
          if (!alive) return;
          setData(value);
          setError(null);
        },
        (err: unknown) => {
          if (alive) setError(err instanceof Error ? err : new Error(String(err)));
        },
      );
    run();
    const off = client.subscribe(run);
    const timer = setInterval(run, REFRESH_MS);
    return () => {
      alive = false;
      off();
      clearInterval(timer);
    };
    // The caller's deps decide when the loader means something new.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error };
}
