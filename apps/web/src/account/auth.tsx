// Customer sign-in, through Clerk. The rest of the site uses `useAccount()` and
// never Clerk directly, so with no Clerk key (local dev without `vercel env pull`,
// or tests) accounts are simply off and checkout works as a guest.
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ClerkProvider, useAuth, useClerk, useUser } from '@clerk/react';

// Set by the Clerk Marketplace integration (vite.config.ts exposes NEXT_PUBLIC_CLERK_*).
const PUBLISHABLE_KEY = import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined;

export interface Account {
  /** off: accounts aren't set up. loading: Clerk is starting. */
  status: 'off' | 'loading' | 'signed-out' | 'signed-in';
  /** From the sign-in, used when the customer hasn't saved their own. */
  name: string;
  email: string;
  /** A fresh session token for `Authorization: Bearer`, or null for a guest. */
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const OFF: Account = { status: 'off', name: '', email: '', getToken: async () => null, signOut: async () => {} };
const AccountContext = createContext<Account>(OFF);

export const useAccount = () => useContext(AccountContext);

/** Headers for an API call, with the session token when signed in. */
export async function authHeaders(account: Account, json = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (json) headers['content-type'] = 'application/json';
  const token = await account.getToken().catch(() => null);
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

function Bridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const value = useMemo<Account>(
    () => ({
      status: !isLoaded ? 'loading' : isSignedIn ? 'signed-in' : 'signed-out',
      name: user?.fullName ?? '',
      email: user?.primaryEmailAddress?.emailAddress ?? '',
      getToken: () => (isSignedIn ? getToken() : Promise.resolve(null)),
      signOut: () => clerk.signOut({ redirectUrl: '/account' }),
    }),
    [isLoaded, isSignedIn, getToken, user, clerk],
  );
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

/** Clerk's sign-in form, in the brand's fonts and colours (all token variables). */
export const clerkAppearance = {
  variables: {
    colorPrimary: 'var(--espresso)',
    colorPrimaryForeground: 'var(--canvas)',
    colorBackground: 'var(--canvas)',
    colorForeground: 'var(--espresso)',
    colorMutedForeground: 'var(--ink-muted)',
    colorMuted: 'var(--paper)',
    colorInput: 'var(--canvas)',
    colorInputForeground: 'var(--espresso)',
    colorBorder: 'var(--line)',
    colorDanger: 'var(--rust)',
    colorRing: 'var(--focus-ring)',
    colorShadow: 'transparent',
    fontFamily: 'var(--font-sans)',
    fontFamilyButtons: 'var(--font-sans)',
    fontFamilyMono: 'var(--font-mono)',
    borderRadius: 'var(--radius-sm)',
  },
  // Hairlines, no shadows or gradients (brand rule). Buttons and inputs: see .account__signin in shop.css.
  elements: {
    cardBox: { boxShadow: 'none', border: '1px solid var(--line)' },
    card: { boxShadow: 'none', border: 0 },
    headerTitle: { fontFamily: 'var(--font-display)', fontWeight: 600 },
    footer: { background: 'var(--paper)', backgroundImage: 'none' },
    dividerLine: { background: 'var(--line)' },
  },
};

/**
 * Clerk's default greetings name the integration ("kuha-ko-auth") and use
 * exclamation marks, which the brand saves for KUHA KO! and Kuha na!.
 */
const clerkLocalization = {
  signIn: { start: { title: 'Sign in', subtitle: 'Welcome back. Sign in to continue.' } },
  signUp: { start: { title: 'Create your account', subtitle: 'It takes a minute.' } },
};

export function AccountProvider({ children }: { children: ReactNode }) {
  if (!PUBLISHABLE_KEY) return <AccountContext.Provider value={OFF}>{children}</AccountContext.Provider>;
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      localization={clerkLocalization}
      signInUrl="/account"
      signUpUrl="/account/sign-up"
      signInFallbackRedirectUrl="/account"
      signUpFallbackRedirectUrl="/account"
      afterSignOutUrl="/account"
    >
      <Bridge>{children}</Bridge>
    </ClerkProvider>
  );
}

export const accountsConfigured = Boolean(PUBLISHABLE_KEY);
