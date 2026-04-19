export function formatVolumeMl(ml: number): { main: string; unit: string; sub: string | null } {
    const n = Number(ml) || 0;
    if (n >= 1000) {
        const l = n / 1000;
        const decimals = l >= 10 ? 1 : 2;
        return { main: l.toFixed(decimals), unit: "L", sub: `${Math.round(n)} ml` };
    }
    return { main: String(Math.round(n)), unit: "ml", sub: null };
}

export function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}
