import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, linkHash } from './supabase.js';
import { api } from './api.js';

const Ctx = createContext({ enabled: false, ready: true, user: null });
export const useAuth = () => useContext(Ctx);

// What an email link reported, in words for the banner.
function linkResult(hash) {
  if (!hash || hash.length < 3) return null;
  const p = new URLSearchParams(hash.replace(/^#\/?/, ''));
  if (p.get('error_description')) {
    return {
      bad: true,
      action: 'signin',
      text: p.get('error_code') === 'otp_expired'
        ? 'That email link has expired or was already used. Sign in, or ask for a new link from there.'
        : p.get('error_description'),
    };
  }
  if (p.get('type') === 'signup') return { text: 'Your email address is confirmed, and you are signed in.' };
  if (p.get('type') === 'email_change') return { text: 'Your new email address is confirmed.' };
  return null;
}

const tokensInHash = () => /(access_token|error_description)=/.test(window.location.hash);
const clearHash = () => window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!supabase);
  const [recovering, setRecovering] = useState(false);
  const [notice, setNotice] = useState(() => linkResult(linkHash));

  useEffect(() => {
    if (!supabase) return undefined;
    // An error link carries no tokens, so it can go at once. Token links are
    // read by the client first; the INITIAL_SESSION event below follows that.
    if (/error_description=/.test(window.location.hash)) clearHash();
    // Never hold the app hostage to the account service: after a few seconds,
    // carry on signed out and let a late answer sign the visitor in.
    const late = setTimeout(() => setReady(true), 4000);
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session ? session.user : null;
      api.setUser(u);
      setUser(u);
      setReady(true);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (tokensInHash()) clearHash();
    });
    return () => { clearTimeout(late); data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!notice || notice.bad) return undefined;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  const value = useMemo(() => ({
    enabled: !!supabase,
    ready,
    user,
    recovering,
    notice,
    doneRecovering: () => setRecovering(false),
    dismissNotice: () => setNotice(null),
    say: n => setNotice(n),
  }), [ready, user, recovering, notice]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
