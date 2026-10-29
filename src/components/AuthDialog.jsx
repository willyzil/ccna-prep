import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';

const TITLES = {
  signin: 'Sign in',
  signup: 'Create your account',
  forgot: 'Reset your password',
  sent: 'Check your inbox',
  newpass: 'Choose a new password',
  account: 'Your account',
  delete: 'Delete your account',
};

// The account service's messages, in words a visitor can act on.
function explain(e) {
  const m = (e && e.message) || String(e);
  if (/invalid login credentials/i.test(m)) return 'That email and password don’t match. Try again, or reset your password.';
  if (/email not confirmed/i.test(m)) return 'unconfirmed';
  if (/rate limit|too many|security purposes/i.test(m)) return 'Too many attempts just now. Wait a minute, then try again.';
  if (/password.*(at least|characters|weak)/i.test(m)) return 'Use a password of at least 8 characters.';
  if (/different from the old password|same password/i.test(m)) return 'Choose a password you haven’t used here before.';
  if (/sending .*email|smtp/i.test(m)) return 'The email couldn’t be sent just now. Try again in a few minutes.';
  if (/failed to fetch|networkerror|load failed/i.test(m)) return 'Can’t reach the account service. Check your connection and try again.';
  return m;
}

function Field({ id, label, hint, ...input }) {
  return (
    <div className="field auth-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} {...input} />
      {hint && <span id={`${id}-hint`} className="auth-hint">{hint}</span>}
    </div>
  );
}

export default function AuthDialog({ start = 'signin', onClose }) {
  const { user, doneRecovering, say } = useAuth();
  const [mode, setMode] = useState(start);
  const [email, setEmail] = useState(user ? user.email : '');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [sent, setSent] = useState(null); // 'signup' | 'reset'
  const [confirmText, setConfirmText] = useState('');
  // Email links bring the visitor back to this page.
  const back = `${window.location.origin}${window.location.pathname}`;

  const go = m => {
    setMode(m);
    setError(null);
    setUnconfirmed(false);
    setPassword('');
    setPassword2('');
  };

  async function run(fn) {
    setBusy(true);
    setError(null);
    setUnconfirmed(false);
    try {
      await fn();
    } catch (e) {
      const text = explain(e);
      if (text === 'unconfirmed') {
        setUnconfirmed(true);
        setError('Confirm your email address first: open the link we sent you.');
      } else {
        setError(text);
      }
    } finally {
      setBusy(false);
    }
  }
  const check = r => { if (r.error) throw r.error; return r.data; };
  const samePasswords = () => {
    if (password === password2) return true;
    setError('The two passwords don’t match.');
    return false;
  };

  const signIn = e => {
    e.preventDefault();
    run(async () => {
      check(await supabase.auth.signInWithPassword({ email, password }));
      say({ text: 'Signed in. Your progress now saves to your account.' });
      onClose();
    });
  };

  const signUp = e => {
    e.preventDefault();
    if (!samePasswords()) return;
    run(async () => {
      check(await supabase.auth.signUp({ email, password, options: { emailRedirectTo: back } }));
      setSent('signup');
      go('sent');
    });
  };

  const resend = () => run(async () => {
    check(await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: back } }));
    setSent('signup');
    go('sent');
  });

  const forgot = e => {
    e.preventDefault();
    run(async () => {
      check(await supabase.auth.resetPasswordForEmail(email, { redirectTo: back }));
      setSent('reset');
      go('sent');
    });
  };

  const newPassword = e => {
    e.preventDefault();
    if (!samePasswords()) return;
    run(async () => {
      check(await supabase.auth.updateUser({ password }));
      doneRecovering();
      say({ text: 'Your new password is saved.' });
      onClose();
    });
  };

  const signOut = () => run(async () => {
    check(await supabase.auth.signOut({ scope: 'local' }));
    say({ text: 'Signed out. Progress now saves in this browser only.' });
    onClose();
  });

  const deleteAccount = e => {
    e.preventDefault();
    run(async () => {
      check(await supabase.rpc('ccna_delete_account'));
      await supabase.auth.signOut({ scope: 'local' });
      say({ text: 'Your account and everything saved in it are deleted.' });
      onClose();
    });
  };

  const close = () => {
    if (mode === 'newpass') doneRecovering();
    onClose();
  };
  const problem = error && (
    <p className="form-error" role="alert">
      {error}
      {unconfirmed && <> <button type="button" className="link-btn" onClick={resend} disabled={busy}>Send the link again</button></>}
    </p>
  );

  let body;
  if (mode === 'signin') {
    body = (
      <form className="auth-form" onSubmit={signIn}>
        <Field id="auth-email" label="Email" type="email" autoComplete="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} />
        <Field id="auth-password" label="Password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        {problem}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div className="auth-links">
          <button type="button" className="link-btn" onClick={() => go('forgot')}>Forgot your password?</button>
          <span>New here? <button type="button" className="link-btn" onClick={() => go('signup')}>Create an account</button></span>
        </div>
      </form>
    );
  } else if (mode === 'signup') {
    body = (
      <form className="auth-form" onSubmit={signUp}>
        <p className="muted auth-lead">Your exams, flags and study ticks save to your account, so they follow you to any device.</p>
        <Field id="auth-email" label="Email" type="email" autoComplete="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} />
        <Field id="auth-password" label="Password" hint="At least 8 characters." type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
        <Field id="auth-password2" label="Repeat password" type="password" autoComplete="new-password" required minLength={8} value={password2} onChange={e => setPassword2(e.target.value)} />
        {problem}
        <button className="btn" disabled={busy}>{busy ? 'Creating your account…' : 'Create account'}</button>
        <div className="auth-links">
          <span>Already have an account? <button type="button" className="link-btn" onClick={() => go('signin')}>Sign in</button></span>
        </div>
      </form>
    );
  } else if (mode === 'forgot') {
    body = (
      <form className="auth-form" onSubmit={forgot}>
        <p className="muted auth-lead">Enter the email you signed up with, and we’ll send you a link to choose a new password.</p>
        <Field id="auth-email" label="Email" type="email" autoComplete="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} />
        {problem}
        <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        <div className="auth-links">
          <button type="button" className="link-btn" onClick={() => go('signin')}>Back to sign in</button>
        </div>
      </form>
    );
  } else if (mode === 'sent') {
    body = (
      <div className="auth-form">
        {sent === 'signup' ? (
          <p>We sent a link to <b>{email}</b>. Open it to confirm your address and finish creating your account. If you already have an account, sign in instead.</p>
        ) : (
          <p>If <b>{email}</b> has an account, a link to choose a new password is on its way.</p>
        )}
        <p className="muted sm">It can take a minute to arrive. Check your spam folder if you don’t see it.</p>
        {problem}
        <div className="auth-links">
          {sent === 'signup' && <button type="button" className="link-btn" onClick={resend} disabled={busy}>Send it again</button>}
          <button type="button" className="link-btn" onClick={() => go('signin')}>Back to sign in</button>
        </div>
      </div>
    );
  } else if (mode === 'newpass') {
    body = (
      <form className="auth-form" onSubmit={newPassword}>
        <Field id="auth-password" label="New password" hint="At least 8 characters." type="password" autoComplete="new-password" required minLength={8} autoFocus value={password} onChange={e => setPassword(e.target.value)} />
        <Field id="auth-password2" label="Repeat new password" type="password" autoComplete="new-password" required minLength={8} value={password2} onChange={e => setPassword2(e.target.value)} />
        {problem}
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    );
  } else if (mode === 'account') {
    body = (
      <div className="auth-form">
        <p>Signed in as <b>{user && user.email}</b>. Your exams, flags and study ticks save to this account.</p>
        {problem}
        <div className="btn-row">
          <button type="button" className="btn ghost" onClick={() => go('newpass')}>Change password</button>
          <button type="button" className="btn ghost" onClick={signOut} disabled={busy}>Sign out</button>
        </div>
        <div className="danger-zone">
          <button type="button" className="link-btn bad-text" onClick={() => go('delete')}>Delete my account…</button>
        </div>
      </div>
    );
  } else {
    body = (
      <form className="auth-form" onSubmit={deleteAccount}>
        <p>This permanently deletes your account and every exam, flag and study tick saved in it. It can’t be undone.</p>
        <Field id="auth-confirm" label="Type DELETE to confirm" autoComplete="off" autoFocus value={confirmText} onChange={e => setConfirmText(e.target.value)} />
        {problem}
        <div className="btn-row">
          <button className="btn danger" disabled={busy || confirmText !== 'DELETE'}>{busy ? 'Deleting…' : 'Delete my account'}</button>
          <button type="button" className="btn ghost" onClick={() => go('account')}>Keep my account</button>
        </div>
      </form>
    );
  }

  return (
    <Modal title={TITLES[mode]} onClose={close}>
      {body}
    </Modal>
  );
}
