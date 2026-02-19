"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type EntityType = "sole_prop" | "llc" | "s_corp" | "c_corp";
type PlanKey = "basic" | "growth" | "pro";

type StateInfo = {
  code: string;
  name: string;
  fee: number; // USD (placeholder estimates for now)
  time: string; // typical processing time
};

const STEPS = ["Entity", "State", "Business", "Owners", "Pricing", "Review"] as const;

export const STATES: StateInfo[] = [
  { code: "AL", name: "Alabama", fee: 200, time: "1–2 weeks" },
  { code: "AK", name: "Alaska", fee: 250, time: "2–3 weeks" },
  { code: "AZ", name: "Arizona", fee: 50, time: "7–14 days" },
  { code: "AR", name: "Arkansas", fee: 45, time: "3–7 days" },
  { code: "CA", name: "California", fee: 70, time: "7–14 days" },
  { code: "CO", name: "Colorado", fee: 50, time: "3–5 days" },
  { code: "CT", name: "Connecticut", fee: 120, time: "3–5 days" },
  { code: "DE", name: "Delaware", fee: 90, time: "7–10 days" },
  { code: "DC", name: "District of Columbia", fee: 99, time: "5–10 days" },
  { code: "FL", name: "Florida", fee: 125, time: "5–10 days" },
  { code: "GA", name: "Georgia", fee: 100, time: "5–7 days" },
  { code: "HI", name: "Hawaii", fee: 50, time: "3–5 days" },
  { code: "ID", name: "Idaho", fee: 100, time: "5–7 days" },
  { code: "IL", name: "Illinois", fee: 150, time: "10–15 days" },
  { code: "IN", name: "Indiana", fee: 95, time: "5–7 days" },
  { code: "IA", name: "Iowa", fee: 50, time: "3–5 days" },
  { code: "KS", name: "Kansas", fee: 160, time: "5–7 days" },
  { code: "KY", name: "Kentucky", fee: 40, time: "3–5 days" },
  { code: "LA", name: "Louisiana", fee: 100, time: "5–7 days" },
  { code: "ME", name: "Maine", fee: 175, time: "5–10 days" },
  { code: "MD", name: "Maryland", fee: 100, time: "5–7 days" },
  { code: "MA", name: "Massachusetts", fee: 500, time: "5–10 days" },
  { code: "MI", name: "Michigan", fee: 50, time: "5–10 days" },
  { code: "MN", name: "Minnesota", fee: 155, time: "5–7 days" },
  { code: "MS", name: "Mississippi", fee: 50, time: "3–5 days" },
  { code: "MO", name: "Missouri", fee: 50, time: "3–5 days" },
  { code: "MT", name: "Montana", fee: 35, time: "5–10 days" },
  { code: "NE", name: "Nebraska", fee: 100, time: "3–5 days" },
  { code: "NV", name: "Nevada", fee: 425, time: "7–10 days" },
  { code: "NH", name: "New Hampshire", fee: 100, time: "5–7 days" },
  { code: "NJ", name: "New Jersey", fee: 125, time: "7–10 days" },
  { code: "NM", name: "New Mexico", fee: 50, time: "3–5 days" },
  { code: "NY", name: "New York", fee: 200, time: "10–15 days" },
  { code: "NC", name: "North Carolina", fee: 125, time: "7–10 days" },
  { code: "ND", name: "North Dakota", fee: 135, time: "5–7 days" },
  { code: "OH", name: "Ohio", fee: 99, time: "3–7 days" },
  { code: "OK", name: "Oklahoma", fee: 100, time: "5–7 days" },
  { code: "OR", name: "Oregon", fee: 100, time: "7–10 days" },
  { code: "PA", name: "Pennsylvania", fee: 125, time: "7–14 days" },
  { code: "RI", name: "Rhode Island", fee: 150, time: "7–10 days" },
  { code: "SC", name: "South Carolina", fee: 110, time: "7–10 days" },
  { code: "SD", name: "South Dakota", fee: 150, time: "1–2 weeks" },
  { code: "TN", name: "Tennessee", fee: 300, time: "7–10 days" },
  { code: "TX", name: "Texas", fee: 300, time: "7–14 days" },
  { code: "UT", name: "Utah", fee: 54, time: "3–5 days" },
  { code: "VT", name: "Vermont", fee: 125, time: "7–10 days" },
  { code: "VA", name: "Virginia", fee: 100, time: "5–7 days" },
  { code: "WA", name: "Washington", fee: 200, time: "5–7 days" },
  { code: "WV", name: "West Virginia", fee: 100, time: "5–7 days" },
  { code: "WI", name: "Wisconsin", fee: 130, time: "5–7 days" },
  { code: "WY", name: "Wyoming", fee: 100, time: "3–5 days" },
];

export default function StartFormationPage() {

  async function goToCheckout() {
  if (isCheckingOut) return;

  try {
    setIsCheckingOut(true);

    const amount = totalDueToday; // number (dollars)
    const description = `BizFoundry Formation (${entityLabel}) in ${selectedState.name}`;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description }),
    });

    // Avoid JSON.parse crash if server returns HTML/text
    const text = await res.text();
    let data: any = null;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("Non-JSON response from /api/checkout:", text);
      alert("Checkout failed (server returned non-JSON). Check terminal logs.");
      return;
    }

    if (!res.ok) {
      alert(data?.error || "Checkout error");
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    alert("Checkout error: missing redirect url");
  } finally {
    setIsCheckingOut(false);
  }
}
  const [step, setStep] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  // Step 1: Entity
  const [entity, setEntity] = useState<EntityType>("llc");

  // Step 2: State
  const [stateCode, setStateCode] = useState("CA");
  const [stateQuery, setStateQuery] = useState("");

  // Step 3: Business
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  // Step 4: Owners
  const [owners, setOwners] = useState<Array<{ name: string; email: string }>>([
    { name: "", email: "" },
  ]);

  // Step 5: Pricing
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("growth");

  const filteredStates = useMemo(() => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return STATES;
    return STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [stateQuery]);

  const selectedState = useMemo(() => {
    return STATES.find((s) => s.code === stateCode) ?? STATES[0];
  }, [stateCode]);

  const entityLabel = useMemo(() => {
    switch (entity) {
      case "sole_prop":
        return "Sole Proprietorship";
      case "llc":
        return "LLC";
      case "s_corp":
        return "S-Corp";
      case "c_corp":
        return "C-Corp";
      default:
        return "LLC";
    }
  }, [entity]);

  const plans = useMemo(
    () => [
      {
        key: "basic" as const,
        name: "Basic",
        price: 129,
        features: [
          "Formation filing",
          "Articles of Organization",
          "Digital delivery",
          "Name verification",
          "Email support",
        ],
      },
      {
        key: "growth" as const,
        name: "Growth",
        price: 249,
        popular: true,
        features: [
          "Everything in Basic",
          "EIN filing",
          "Operating Agreement",
          "Ownership documentation",
          "Compliance reminder",
          "Priority support",
        ],
      },
      {
        key: "pro" as const,
        name: "Pro",
        price: 399,
        features: [
          "Everything in Growth",
          "Registered Agent (1 year)",
          "Annual compliance monitoring",
          "Expedited processing",
          "Founder dashboard",
          "Document vault",
        ],
      },
    ],
    []
  );

  const selectedPlanData = useMemo(() => {
    return plans.find((p) => p.key === selectedPlan) ?? plans[0];
  }, [plans, selectedPlan]);

  const totalDueToday = useMemo(() => {
    return selectedPlanData.price + selectedState.fee;
  }, [selectedPlanData.price, selectedState.fee]);

  const progressPct = Math.round(((step + 1) / STEPS.length) * 100);

  const canGoNext = useMemo(() => {
    if (step === 0) return !!entity;
    if (step === 1) return !!stateCode;
    if (step === 2) return businessName.trim().length > 1;
    if (step === 3) return owners.some((o) => o.name.trim().length > 1);
    if (step === 4) return !!selectedPlan;
    return true;
  }, [step, entity, stateCode, businessName, owners, selectedPlan]);

  function handleNext() {
    if (!canGoNext) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function addOwner() {
    setOwners((prev) => [...prev, { name: "", email: "" }]);
  }

  function removeOwner(idx: number) {
    setOwners((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOwner(idx: number, key: "name" | "email", value: string) {
    setOwners((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, [key]: value } : o))
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">BizFoundry</div>
          <div className="text-sm text-slate-400">Formation Wizard</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* LEFT */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold">Start formation</div>
                <div className="mt-1 text-sm text-slate-400">
                  Step {step + 1} of {STEPS.length}: {STEPS[step]}
                </div>
              </div>
              <Link
                href="/"
                className="text-sm text-slate-300 underline underline-offset-4"
              >
                Exit
              </Link>
            </div>

            <div className="mt-6">
              <div className="h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-white/40"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {/* STEP 1: ENTITY */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold">Choose entity type</div>
                  <button onClick={() => setStep(1)} 
                  className="mt-6 w-full rounded-xl bg-white text-black py-3 font-semibold hover:bg-gray-200 transition"
                  > Next </button>
<div className="mt-8 flex gap-3">
  
</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      {
                        key: "sole_prop" as const,
                        label: "Sole Proprietorship",
                        desc: "Simple start, minimal docs.",
                      },
                      {
                        key: "llc" as const,
                        label: "LLC",
                        desc: "Most common for small businesses.",
                      },
                      {
                        key: "s_corp" as const,
                        label: "S-Corp",
                        desc: "Tax status + more complexity.",
                      },
                      {
                        key: "c_corp" as const,
                        label: "C-Corp",
                        desc: "Standard for venture-backed.",
                      },
                    ].map((o) => {
                      const isSelected = entity === o.key;
                      return (
                        <button
                          key={o.key}
                          onClick={() => setEntity(o.key)}
                          className={`rounded-2xl border p-5 text-left transition ${isSelected
                            ? "border-white bg-white/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                        >
                          <div className="text-sm font-semibold">{o.label}</div>
                          <div className="mt-1 text-xs text-slate-300">
                            {o.desc}
                          </div>
                        </button>
                      ) ;
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: STATE */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold">
                    Select formation state
                  </div>

                  <label className="block text-sm text-slate-200">
                    State search
                    <input
                      type="text"
                      placeholder="Search state..."
                      value={stateQuery}
                      onChange={(e) => setStateQuery(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-white/30"
                    />
                  </label>

                  <label className="block text-sm text-slate-200">
                    State
                    <select
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-white/30"
                    >
                      {filteredStates.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div>
                      <span className="text-slate-400">
                        Estimated state filing fee:
                      </span>{" "}
                      <span className="font-semibold">${selectedState.fee}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-400">
                        Typical processing time:
                      </span>{" "}
                      <span className="font-semibold">{selectedState.time}</span>
                    </div><div className="mt-6 flex gap-3">
  <button
    type="button"
    onClick={handleBack}
    className="w-1/2 rounded-xl border border-white/20 bg-white/5 py-3 font-semibold text-white hover:bg-white/10 transition"
  > Back </button> <button
    type="button"
    onClick={handleNext}
    disabled={!selectedState}
    className="w-1/2 rounded-xl bg-white py-3 font-semibold text-black hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
  > Next </button> </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BUSINESS */}
{step === 2 && (
  <div className="space-y-4">
    <div className="text-lg font-semibold">Business details</div>

    <label className="block text-sm text-slate-200">
      Business name
      <input
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2"
        placeholder="e.g. Acme Holdings LLC"
      />
    </label>

    <label className="block text-sm text-slate-200">
      Business address
      <input
        value={businessAddress}
        onChange={(e) => setBusinessAddress(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2"
        placeholder="Street, City, State, ZIP"
      />
    </label>

    {/* NAV BUTTONS */}
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={handleBack}
        className="w-1/2 rounded-xl border border-white/20 bg-white/5 py-3 font-semibold text-white"
      >
        Back
      </button>

      <button
  type="button"
  onClick={handleNext}
  disabled={!(businessName.trim().length >= 2 && businessAddress.trim().length >= 5)}
  className="w-1/2 rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-40"
>
  Next
</button>
    </div>
  </div>
)}

              {/* STEP 4: OWNERS */}
{step === 3 && (
  <div className="space-y-4">
    <div className="text-lg font-semibold">Owners</div>
    <div className="text-sm text-slate-300">
      Add each owner’s name and email. You need at least 1 owner.
    </div>

    <div className="space-y-3">
      {owners.map((owner, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">
              Owner {idx + 1}
            </div>

            {owners.length > 1 && (
              <button
                type="button"
                onClick={() => removeOwner(idx)}
                className="text-sm text-red-300 hover:text-red-200"
              >
                Remove
              </button>
            )}
          </div>

          <label className="block text-sm text-slate-200">
            Full name
            <input
              value={owner.name}
              onChange={(e) => updateOwner(idx, "name", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2"
              placeholder="e.g. Jane Doe"
            />
          </label>

          <label className="block text-sm text-slate-200">
            Email
            <input
              value={owner.email}
              onChange={(e) => updateOwner(idx, "email", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2"
              placeholder="e.g. jane@company.com"
            />
          </label>
        </div>
      ))}
    </div>

    <button
      type="button"
      onClick={addOwner}
      className="w-full rounded-xl border border-white/20 bg-white/5 py-3 font-semibold text-white hover:bg-white/10"
    >
      + Add another owner
    </button>

    {/* NAV BUTTONS */}
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={handleBack}
        className="w-1/2 rounded-xl border border-white/20 bg-white/5 py-3 font-semibold text-white"
      >
        Back
      </button>

      <button
        type="button"
        onClick={handleNext}
        disabled={
          !owners.some(
            (o) =>
              o.name.trim().length >= 2 &&
              o.email.trim().includes("@") &&
              o.email.trim().includes(".")
          )
        }
        className="w-1/2 rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-40"
      >
        Next
      </button>
    </div>
  </div>
)}

        {/* STEP 5: PRICING */}
{step === 4 && (
  <div className="space-y-6">
    <div>
      <div className="text-lg font-semibold">Choose a plan</div>
      <div className="text-sm text-slate-300">
        Select the service plan you want. You can change this later.
      </div>
    </div>

    {/* PLAN OPTIONS */}
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => {
        const active = selectedPlan === plan.key;

        return (
          <button
            key={plan.key}
            type="button"
            onClick={() => setSelectedPlan(plan.key)}
            className={`text-left rounded-2xl border p-5 transition ${
              active
                ? "border-white bg-white/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-slate-100">
                  {plan.name} {plan.popular ? "• Popular" : ""}
                </div>

                <div className="mt-1 text-sm text-slate-300">
                  {plan.features?.[0] ?? "Plan includes core filing + support"}
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  {plan.features?.slice(1, 4).join(" • ")}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-slate-100">
                  ${plan.price}
                </div>
                <div className="text-xs text-slate-400">service</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>

    {/* NAV BUTTONS */}
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={handleBack}
        className="w-1/2 rounded-xl border border-white/20 bg-white/5 py-3 font-semibold text-white hover:bg-white/10 transition"
      >
        Back
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="w-1/2 rounded-xl bg-white py-3 font-semibold text-black hover:bg-gray-200 transition"
      >
        Next
      </button>
    </div>
  </div>
)}
              
              {/* STEP 6: REVIEW */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold">Review</div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
                    <div className="grid gap-2">
                      <div>
                        <span className="text-slate-400">Entity:</span>{" "}
                        <span className="font-semibold">{entityLabel}</span>
                      </div>

                      <div>
                        <span className="text-slate-400">State:</span>{" "}
                        <span className="font-semibold">
                          {selectedState.name} ({selectedState.code})
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400">Business:</span>{" "}
                        <span className="font-semibold">{businessName || "(not set)"}</span>
                      </div>

                      <div>
                        <span className="text-slate-400">Owners:</span>{" "}
                        <span className="font-semibold">{owners.length}</span>
                      </div>

                      <div>
                        <span className="text-slate-400">Plan:</span>{" "}
                        <span className="font-semibold">{selectedPlanData.name}</span>
                      </div>

                      <div className="pt-2">
                        <span className="text-slate-400">Total due today:</span>{" "}
                        <span className="text-lg font-bold">${totalDueToday}</span>
                      </div>
                    </div>
                  </div>

                  <button
                  onClick={goToCheckout}
                  disabled={isCheckingOut}
                    className="mt-2 w-full rounded-xl bg-white text-black py-3 font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                    {isCheckingOut ? "Redirecting to Stripe..." : "Pay & Submit Formation"}
                  </button>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(step - 1)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Back
                    </button>

                    <button
                      onClick={() => setStep(0)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )                                          }
              {/* RIGHT SUMMARY */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-semibold">Summary</div>

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <div>
                    <span className="text-slate-400">Entity:</span>{" "}
                    {entityLabel || "(not set)"}
                  </div>
                  <div>
                    <span className="text-slate-400">State:</span>{" "}
                    {selectedState.code}
                  </div>
                  <div>
                    <span className="text-slate-400">Name:</span>{" "}
                    {businessName || "(not set)"}
                  </div>
                  <div>
                    <span className="text-slate-400">Owners:</span> {owners.length}
                  </div>
                  <div>
                    <span className="text-slate-400">Plan:</span>{" "}
                    {selectedPlanData.name}
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-400">Total due today</div>
                    <div className="mt-1 text-xl font-bold">${totalDueToday}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      ${selectedPlanData.price} service + ${selectedState.fee} state
                    </div>
                  </div>
                </div>
              </div>
            </div>

                    <div className="mt-8 text-xs text-slate-500">
          Note: State fees here are placeholders for UI/testing. We'll swap to the real per-entity/per-state schedule later.
        </div>

        {/* END LEFT CARD */}
      </div>

      {/* END GRID WRAPPER */}
    </div>

    {/* END MX-AUTO WRAPPER */}
  </div>

  {/* END PAGE WRAPPER */}
</div>
);
}