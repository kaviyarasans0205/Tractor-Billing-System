import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hashPassword, isUnlocked, loadSettings, setUnlocked } from "@/lib/settings";
import { Lock } from "lucide-react";
import { toast } from "sonner";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pw, setPw] = useState("");
  const [expectedHash, setExpectedHash] = useState<string | undefined>();

  useEffect(() => {
    const s = loadSettings();
    if (s.passwordEnabled && s.passwordHash && !isUnlocked()) {
      setExpectedHash(s.passwordHash);
      setLocked(true);
    }
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!locked) return <>{children}</>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = await hashPassword(pw);
    if (h === expectedHash) {
      setUnlocked(true);
      setLocked(false);
      toast.success("திறக்கப்பட்டது");
    } else {
      toast.error("தவறான கடவுச்சொல்");
      setPw("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-lg"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-primary">KPS கவர்பணை</h1>
          <p className="text-xs text-muted-foreground">உரிமையாளர் மட்டுமே</p>
        </div>
        <Input
          type="password"
          placeholder="கடவுச்சொல் உள்ளிடவும்"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />
        <Button type="submit" className="w-full">
          திற
        </Button>
      </form>
    </div>
  );
}
