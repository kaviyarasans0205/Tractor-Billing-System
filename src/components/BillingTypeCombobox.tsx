import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllBillingTypes, saveCustomBillingType } from "@/lib/billing-types";

const CUSTOM = "__custom__";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function BillingTypeCombobox({ value, onChange }: Props) {
  const types = useMemo(() => getAllBillingTypes(), []);
  const [custom, setCustom] = useState("");
  const isCustom = value && !types.includes(value);

  return (
    <div className="space-y-1">
      <Select
        value={isCustom ? CUSTOM : value || ""}
        onValueChange={(v) => {
          if (v === CUSTOM) onChange("");
          else onChange(v);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="பில்லிங் வகை" />
        </SelectTrigger>
        <SelectContent>
          {types.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM}>+ புதிய வகை</SelectItem>
        </SelectContent>
      </Select>
      {(isCustom || value === "") && (
        <div className="flex gap-2">
          <Input
            placeholder="புதிய வகை பெயர்"
            value={isCustom ? value : custom}
            onChange={(e) => {
              if (isCustom) onChange(e.target.value);
              else setCustom(e.target.value);
            }}
          />
          {!isCustom && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const v = custom.trim();
                if (!v) return;
                saveCustomBillingType(v);
                onChange(v);
                setCustom("");
              }}
            >
              சேர்
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
