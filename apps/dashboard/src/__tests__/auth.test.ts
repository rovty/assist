import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearRecentLogout, hasRecentLogout, markRecentLogout } from '@/lib/auth';

describe('logout redirect marker', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('marks a recent logout for the login page redirect guard', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);

    markRecentLogout();

    expect(hasRecentLogout()).toBe(true);
  });

  it('expires the logout marker after the grace window', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);
    markRecentLogout();

    vi.spyOn(Date, 'now').mockReturnValue(12_000);

    expect(hasRecentLogout()).toBe(false);
    expect(window.sessionStorage.length).toBe(0);
  });

  it('clears the logout marker when a new auth flow starts', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);
    markRecentLogout();

    clearRecentLogout();

    expect(hasRecentLogout()).toBe(false);
  });
});
