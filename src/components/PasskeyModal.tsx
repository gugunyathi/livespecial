import { useState, useEffect } from "react";
import {
  type PasskeyUser,
  getStoredUsers,
  createPasskeyRegistration,
  authenticateWithPasskey,
} from "@/lib/passkey-auth";

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: PasskeyUser) => void;
  initialMode?: "signin" | "signup";
}

export function PasskeyModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "signin",
}: PasskeyModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [existingUsers, setExistingUsers] = useState<PasskeyUser[]>([]);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState<PasskeyUser | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      const users = getStoredUsers();
      setExistingUsers(users);
      setStatus("idle");
      setErrorMessage("");
      if (users.length === 0 && initialMode === "signin") {
        setMode("signup");
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSignIn = async (userId?: string) => {
    try {
      setStatus("verifying");
      setErrorMessage("");
      // Add slight natural biometric verification latency
      await new Promise((r) => setTimeout(r, 650));
      const user = await authenticateWithPasskey(userId);
      setAuthenticatedUser(user);
      setStatus("success");
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([40, 30, 90]);
      }
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 700);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Passkey verification timed out or was cancelled.",
      );
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage("Please enter an agent identifier or name.");
      return;
    }

    try {
      setStatus("verifying");
      setErrorMessage("");
      await new Promise((r) => setTimeout(r, 700));
      const user = await createPasskeyRegistration(username, displayName || username);
      setAuthenticatedUser(user);
      setStatus("success");
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([50, 40, 100]);
      }
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 750);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Passkey registration failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass relative w-full max-w-md rounded-3xl border border-border/80 p-6 sm:p-7 shadow-2xl overflow-hidden animate-slideup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/20 text-primary border border-primary/30">
              <span className="text-xl">🔑</span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                FIDO2 / WebAuthn
              </p>
              <h3 className="text-lg font-bold text-foreground">
                {mode === "signin" ? "Passkey Sign In" : "Register New Passkey"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Verification Status Animation */}
        {status === "verifying" && (
          <div className="my-8 flex flex-col items-center justify-center text-center py-4 animate-fade-in">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/15 border border-primary/50 text-2xl animate-breathe shadow-teal">
                👆
              </div>
            </div>
            <p className="mt-4 font-mono text-sm font-semibold text-primary">
              Biometric Authorization Required
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Touch your fingerprint sensor, scan Face ID, or insert security key to authenticate
              your agent.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="my-8 flex flex-col items-center justify-center text-center py-4 animate-fade-in">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-accent/20 border border-accent text-3xl shadow-amber">
              ✓
            </div>
            <p className="mt-4 font-mono text-sm font-bold text-accent">Passkey Verified!</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Welcome back, {authenticatedUser?.displayName || "Agent Pilot"}. Unlocking autonomous
              commerce mesh…
            </p>
          </div>
        )}

        {status === "idle" && (
          <div className="mt-6 relative z-10">
            {mode === "signin" ? (
              <div className="space-y-4">
                {existingUsers.length > 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select stored agent credential:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {existingUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSignIn(user.id)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl border border-border/80 bg-muted/30 hover:border-primary/60 hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-mono text-primary font-bold shrink-0">
                              {user.name.slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {user.displayName}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground truncate">
                                @{user.name} · {user.deviceType}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-xs text-primary font-bold ml-2 shrink-0">
                            Unlock →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">
                      No passkeys found on this device.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleSignIn()}
                  className="bg-cta w-full min-h-[44px] rounded-xl py-2.5 px-4 font-bold text-sm text-accent-foreground shadow-amber transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Use Device Biometrics / Passkey</span>
                  <span>🔐</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMessage("");
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    Need a new agent passkey? Register here
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Agent Identifier / Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. AgentCipher or Alex"
                    required
                    className="w-full rounded-xl border border-input bg-muted/60 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex (Autonomous Pilot)"
                    className="w-full rounded-xl border border-input bg-muted/60 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    <span>🛡️</span> Zero Password Cryptography
                  </p>
                  <p className="mt-1">
                    Generates a private cryptographic key securely stored inside your hardware
                    Secure Enclave.
                  </p>
                </div>

                <button
                  type="submit"
                  className="bg-cta w-full min-h-[44px] rounded-xl py-2.5 px-4 font-bold text-sm text-accent-foreground shadow-amber transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Create & Enroll Passkey</span>
                  <span>✨</span>
                </button>

                {existingUsers.length > 0 && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setErrorMessage("");
                      }}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                    >
                      Already have an agent passkey? Sign in
                    </button>
                  </div>
                )}
              </form>
            )}

            {errorMessage && (
              <p className="mt-3 text-xs text-destructive text-center font-medium">
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
