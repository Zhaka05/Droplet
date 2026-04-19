import { useId, useMemo } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { DailyWaste } from "../types";

type Row = { label: string; volume_ml: number; day: string };

type Props = {
    byDay: DailyWaste[];
    maxPoints?: number;
};

export function TrendChart({ byDay, maxPoints = 40 }: Props) {
    const gid = useId().replace(/:/g, "");
    const data = useMemo<Row[]>(() => {
        const slice = byDay.length > maxPoints ? byDay.slice(-maxPoints) : byDay;
        return slice.map((d) => ({
            day: d.day,
            label: d.day.slice(5),
            volume_ml: d.volume_ml,
        }));
    }, [byDay, maxPoints]);

    if (data.length === 0) {
        return <p className="state-msg">No data in this range.</p>;
    }

    return (
        <div className="chart-card" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.85} />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="label"
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis hide domain={[0, "auto"]} />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.2)",
                            background: "rgba(15,23,42,0.95)",
                            color: "#f8fafc",
                        }}
                        formatter={(v: number) => [`${v} ml`, "Waste"]}
                        labelFormatter={(_, payload) => {
                            const row = payload?.[0]?.payload as Row | undefined;
                            return row?.day ?? "";
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="volume_ml"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        fill={`url(#g-${gid})`}
                        dot={false}
                        activeDot={{ r: 5, fill: "#22d3ee", stroke: "#0c4a6e", strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
