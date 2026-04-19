export type PeriodKey = "7" | "30" | "month";

export interface DailyWaste {
    day: string;
    volume_ml: number;
}

export interface WasteSummaryResponse {
    period_start: string;
    period_end: string;
    total_volume_ml: number;
    by_day: DailyWaste[];
}

export interface SinkSummary {
    id: string;
    name: string;
    location: string | null;
    total_volume_ml: number;
}

export interface SinkListResponse {
    period_start: string;
    period_end: string;
    sinks: SinkSummary[];
}

export interface WasteEvent {
    id: string;
    sink_id: string;
    at: string;
    volume_ml: number;
}

export interface SinkDetailResponse {
    id: string;
    name: string;
    location: string | null;
    period_start: string;
    period_end: string;
    total_volume_ml: number;
    by_day: DailyWaste[];
    recent_events: WasteEvent[];
}
