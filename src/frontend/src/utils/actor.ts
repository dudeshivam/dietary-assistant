import { createActor } from "@/backend";
import type { Backend } from "@/backend";
import { createActorWithConfig } from "@caffeineai/core-infrastructure";

// Cached actor instance — created once, reused for all calls.
// Since all auth is via sessionToken (method argument), a single
// anonymous actor is all we need.
let _actorPromise: Promise<Backend> | null = null;

/**
 * Returns a promise that resolves to the backend actor.
 * Uses an anonymous HttpAgent — all auth is handled via sessionToken
 * passed as the first argument to each backend method.
 *
 * Caches the actor across calls so we only initialise once.
 * Call resetBackendActor() if you need a fresh instance (e.g. during tests).
 */
export function getBackendActor(): Promise<Backend> {
  if (!_actorPromise) {
    _actorPromise = createActorWithConfig(createActor).catch((err) => {
      // Reset so the next call retries
      _actorPromise = null;
      throw err;
    });
  }
  return _actorPromise;
}

/** Reset the cached actor (useful after config changes or in tests). */
export function resetBackendActor(): void {
  _actorPromise = null;
}
