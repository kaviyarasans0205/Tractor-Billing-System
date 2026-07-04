import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { hashPassword, loadSettings, saveSettings, setUnlocked } from "@/lib/settings";
import { PAYEE_MOBILE, PAYEE_NAME, PAYEE_VPA } from "@/lib/upi";

export default function SettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [hasPw, setHasPw] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => {
    const s = loadSettings();
    setEnabled(s.passwordEnabled);
    setHasPw(!!s.passwordHash);
  }, []);

  const savePw = async () => {
    if (!pw || pw.length < 4) {
      toast.error("குறைந்தது 4 எழுத்துக்கள் தேவை");
      return;
    }
    const hash = await hashPassword(pw);
    saveSettings({ passwordEnabled: true, passwordHash: hash });
    setUnlocked(true);
    setEnabled(true);
    setHasPw(true);
    setPw("");
    toast.success("கடவுச்சொல் அமைக்கப்பட்டது");
  };

  const toggle = (v: boolean) => {
    const s = loadSettings();
    if (v && !s.passwordHash) {
      toast.error("முதலில் கடவுச்சொல் அமைக்கவும்");
      return;
    }
    saveSettings({ ...s, passwordEnabled: v });
    setEnabled(v);
    toast.success(v ? "லாக் இயக்கப்பட்டது" : "லாக் நிறுத்தப்பட்டது");
  };

  const removePw = () => {
    saveSettings({ passwordEnabled: false });
    setEnabled(false);
    setHasPw(false);
    toast.info("கடவுச்சொல் நீக்கப்பட்டது");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">அமைப்புகள்</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">பணம் பெறுநர் (Owner)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>பெயர்: <b>{PAYEE_NAME}</b> (சோலைமுத்து)</p>
          <p>மொபைல்: <b>{PAYEE_MOBILE}</b></p>
          <p>UPI ID: <b>{PAYEE_VPA}</b></p>
          <p className="text-xs text-muted-foreground">
            இந்த விவரங்கள் QR மற்றும் PDF-ல் தானாக பயன்படுத்தப்படும்.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">பாதுகாப்பு (Owner Lock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">கடவுச்சொல் இயக்கு</p>
              <p className="text-xs text-muted-foreground">
                App திறக்கும்போது கடவுச்சொல் கேட்கும்
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={toggle} />
          </div>

          <div className="space-y-2">
            <Label>{hasPw ? "புதிய கடவுச்சொல் அமை" : "கடவுச்சொல் அமை"}</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="குறைந்தது 4 எழுத்துக்கள்"
              />
              <Button onClick={savePw}>சேமிக்க</Button>
            </div>
            {hasPw && (
              <Button variant="ghost" size="sm" onClick={removePw} className="text-destructive">
                கடவுச்சொல் நீக்கு
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">பயன்பாடு பற்றி</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>KPS கவர்பணை · Owner Billing System</p>
          <p>தரவு உங்கள் மொபைலிலேயே (localStorage) சேமிக்கப்படுகிறது.</p>
          <p>Home screen-ல் Install செய்ய: Browser Menu → "Add to Home Screen".</p>
        </CardContent>
      </Card>
    </div>
  );
}
