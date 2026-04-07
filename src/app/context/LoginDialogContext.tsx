import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LoginDialog } from "../components/LoginDialog";

type LoginDialogContextValue = {
  openLogin: () => void;
};

const LoginDialogContext = createContext<LoginDialogContextValue | undefined>(undefined);

export function LoginDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openLogin = useCallback(() => {
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openLogin }), [openLogin]);

  return (
    <LoginDialogContext.Provider value={value}>
      {children}
      <LoginDialog open={open} onOpenChange={setOpen} />
    </LoginDialogContext.Provider>
  );
}

export function useLoginDialog() {
  const ctx = useContext(LoginDialogContext);
  if (!ctx) {
    throw new Error("useLoginDialog must be used within LoginDialogProvider");
  }
  return ctx;
}
