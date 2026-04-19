import type { PeriodKey } from "../types";

const OPTIONS: { key: PeriodKey; label: string }[] = [
    { key: "7", label: "7 days" },
    { key: "30", label: "30 days" },
    { key: "month", label: "This month" },
];

type Props = {
    value: PeriodKey;
    onChange: (p: PeriodKey) => void;
};

export function PeriodChips({ value, onChange }: Props) {
    return (
        <div className="chip-row" role="group" aria-label="Time range">
            {OPTIONS.map((o) => (
                <button
                    key={o.key}
                    type="button"
                    className={`chip${o.key === value ? " is-active" : ""}`}
                    onClick={() => onChange(o.key)}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
