import type { PeriodKey, SinkDetailResponse, SinkListResponse, WasteSummaryResponse } from "./types";

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

function toISODate(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function periodQuery(period: PeriodKey): string {
    if (period === "month") {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return `start=${toISODate(start)}&end=${toISODate(end)}`;
    }
    const days = period === "7" ? 7 : 30;
    return `days=${days}`;
}

async function getJSON<T>(path: string): Promise<T> {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
}

export function fetchSummary(period: PeriodKey): Promise<WasteSummaryResponse> {
    return getJSON<WasteSummaryResponse>(`/api/waste/summary?${periodQuery(period)}`);
}

export function fetchSinks(period: PeriodKey): Promise<SinkListResponse> {
    return getJSON<SinkListResponse>(`/api/sinks?${periodQuery(period)}`);
}

export function fetchSinkDetail(sinkId: string, period: PeriodKey): Promise<SinkDetailResponse> {
    return getJSON<SinkDetailResponse>(`/api/sinks/${encodeURIComponent(sinkId)}?${periodQuery(period)}`);
}
