import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { CustomerInfo, listCustomers } from "@/lib/customers";
import { Check, User } from "lucide-react";

interface Props {
  name: string;
  mobile: string;
  onSelect: (c: { name: string; mobile: string; village?: string; id?: string }) => void;
  onChangeName: (v: string) => void;
  onChangeMobile: (v: string) => void;
}

export function CustomerCombobox({ name, mobile, onSelect, onChangeName, onChangeMobile }: Props) {
  const [open, setOpen] = useState(false);
  const customers = useMemo(() => listCustomers(), [open]);

  const q = name.trim().toLowerCase();
  const filtered = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.mobile || "").includes(q) ||
          (c.village || "").toLowerCase().includes(q),
      )
    : customers.slice(0, 8);

  const exactMatch = customers.find((c) => c.name === name.trim());

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="relative space-y-1">
        <Input
          placeholder="பெயர் — தேடு அல்லது புதியது"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          required
        />
        {exactMatch && (
          <p className="text-[11px] text-success flex items-center gap-1">
            <Check className="h-3 w-3" /> ஏற்கனவே உள்ள வாடிக்கையாளர்
          </p>
        )}
        {open && filtered.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover shadow-lg">
            {filtered.map((c) => (
              <button
                key={c.name}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect({ name: c.name, mobile: c.mobile || "", village: c.village, id: c.id });
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{c.name}</span>
                {c.mobile && <span className="text-xs text-muted-foreground">{c.mobile}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      <Input
        placeholder="மொபைல் (விருப்பம்)"
        value={mobile}
        onChange={(e) => onChangeMobile(e.target.value)}
        inputMode="tel"
      />
    </div>
  );
}
