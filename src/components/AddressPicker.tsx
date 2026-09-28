import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { AddressDto, AddressRequest } from "../types";

export const ADDRESS_TYPES = [
  { value: 0, label: "Home" },
  { value: 1, label: "Office" },
  { value: 2, label: "Other" },
] as const;

export function addressTypeValue(type?: number | string | null) {
  if (type === 1 || type === "Work" || type === "Office") return 1;
  if (type === 2 || type === "Other") return 2;
  return 0;
}

export function addressTypeLabel(type?: number | string | null) {
  return ADDRESS_TYPES.find((item) => item.value === addressTypeValue(type))?.label ?? "Home";
}

export function formatAddress(addr: AddressDto) {
  return [addr.houseFlat, addr.street, addr.area, addr.landmark, addr.city, addr.state, addr.pincode]
    .filter((part) => part && String(part).trim())
    .join(", ");
}

const emptyAddress: AddressRequest = {
  fullName: "",
  mobile: "",
  houseFlat: "",
  street: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  addressType: 0,
  isDefault: false,
};

type Props = {
  selectedId: number | null;
  enabled?: boolean;
  onSelect: (address: AddressDto) => void;
};

export function AddressPicker({ selectedId, enabled = true, onSelect }: Props) {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState<AddressRequest>(emptyAddress);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  selectedRef.current = selectedId;
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    api<AddressDto[]>("/addresses")
      .then((list) => {
        if (cancelled) return;
        setAddresses(list);
        if (!list.length) {
          setShowNew(true);
          return;
        }
        const current = selectedRef.current;
        const chosen = list.find((item) => item.id === current) ?? list.find((item) => item.isDefault) ?? list[0];
        if (chosen && chosen.id !== current) onSelectRef.current(chosen);
      })
      .catch(() => {
        if (!cancelled) setShowNew(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const save = () => {
    if (!draft.fullName.trim() || !draft.mobile.trim() || !draft.houseFlat.trim() || !draft.city.trim() || !draft.state.trim() || !draft.pincode.trim()) {
      setError("Fill name, mobile, house, city, state, and PIN.");
      return;
    }
    setSaving(true);
    setError("");
    void api<AddressDto>("/addresses", {
      method: "POST",
      body: { ...draft, isDefault: addresses.length === 0 },
    })
      .then((created) => {
        setAddresses((prev) => [...prev, created]);
        setDraft(emptyAddress);
        setShowNew(false);
        onSelect(created);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not save address"))
      .finally(() => setSaving(false));
  };

  return (
    <div className="address-book">
      <div className="checkout-address-list">
        {addresses.map((addr) => (
          <label key={addr.id} className={`checkout-address${selectedId === addr.id ? " selected" : ""}`}>
            <input type="radio" name="saved-address" checked={selectedId === addr.id} onChange={() => onSelect(addr)} />
            <span>
              <strong>
                <em className="address-type">{addressTypeLabel(addr.addressType)}</em>
                {addr.fullName}
              </strong>
              <em>{addr.mobile}</em>
              <em>{formatAddress(addr)}</em>
            </span>
          </label>
        ))}
      </div>
      <button type="button" className="btn secondary" onClick={() => setShowNew((open) => !open)}>
        {showNew ? "Hide form" : "Add new address"}
      </button>
      {showNew && (
        <div className="address-form">
          <div className="address-type-row" role="group" aria-label="Address type">
            {ADDRESS_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`address-type-chip${draft.addressType === type.value ? " selected" : ""}`}
                onClick={() => setDraft({ ...draft, addressType: type.value })}
              >
                {type.label}
              </button>
            ))}
          </div>
          <input required placeholder="Full name" value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
          <input required placeholder="Mobile" value={draft.mobile} onChange={(e) => setDraft({ ...draft, mobile: e.target.value })} />
          <input required placeholder="House / Flat" value={draft.houseFlat} onChange={(e) => setDraft({ ...draft, houseFlat: e.target.value })} />
          <input placeholder="Street" value={draft.street ?? ""} onChange={(e) => setDraft({ ...draft, street: e.target.value })} />
          <input placeholder="Area" value={draft.area ?? ""} onChange={(e) => setDraft({ ...draft, area: e.target.value })} />
          <input placeholder="Landmark" value={draft.landmark ?? ""} onChange={(e) => setDraft({ ...draft, landmark: e.target.value })} />
          <input required placeholder="City" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
          <input required placeholder="State" value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
          <input required placeholder="PIN code" value={draft.pincode} onChange={(e) => setDraft({ ...draft, pincode: e.target.value })} />
          {error && <p className="auth-error">{error}</p>}
          <button className="btn primary" type="button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save address"}</button>
        </div>
      )}
    </div>
  );
}
