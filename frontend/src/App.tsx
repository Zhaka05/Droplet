import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { fetchSinkDetail, fetchSinks, fetchSummary } from "./api";
import { AmbientBackdrop } from "./components/AmbientBackdrop";
import { DropletMark } from "./components/DropletMark";
import { PeriodChips } from "./components/PeriodChips";
import { TrendChart } from "./components/TrendChart";
import { formatDateTime, formatVolumeMl } from "./format";
import type { PeriodKey, SinkDetailResponse, SinkListResponse, WasteSummaryResponse } from "./types";

type Route =
    | { screen: "overview" }
    | { screen: "sinks" }
    | { screen: "sink"; sinkId: string };

export default function App() {
    const [route, setRoute] = useState<Route>({ screen: "overview" });
    const [period, setPeriod] = useState<PeriodKey>("30");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [summary, setSummary] = useState<WasteSummaryResponse | null>(null);
    const [sinkList, setSinkList] = useState<SinkListResponse | null>(null);
    const [sinkDetail, setSinkDetail] = useState<SinkDetailResponse | null>(null);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const s = await fetchSummary(period);
            setSummary(s);
        } catch {
            setError("Could not load data. Is the API running?");
        } finally {
            setLoading(false);
        }
    }, [period]);

    const loadSinks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const s = await fetchSinks(period);
            setSinkList(s);
        } catch {
            setError("Could not load sinks.");
        } finally {
            setLoading(false);
        }
    }, [period]);

    const loadSink = useCallback(
        async (sinkId: string) => {
            setLoading(true);
            setError(null);
            try {
                const d = await fetchSinkDetail(sinkId, period);
                setSinkDetail(d);
            } catch {
                setError("Could not load sink.");
            } finally {
                setLoading(false);
            }
        },
        [period],
    );

    useEffect(() => {
        if (route.screen === "overview") void loadOverview();
        else if (route.screen === "sinks") void loadSinks();
        else void loadSink(route.sinkId);
    }, [route, period, loadOverview, loadSinks, loadSink]);

    const goOverview = () => {
        setRoute({ screen: "overview" });
    };
    const goSinks = () => {
        setRoute({ screen: "sinks" });
    };
    const goSink = (sinkId: string) => {
        setRoute({ screen: "sink", sinkId });
    };

    const header = (() => {
        if (route.screen === "sink" && sinkDetail) {
            return {
                eyebrow: sinkDetail.location || "Fixture",
                title: sinkDetail.name,
                showBack: true,
            };
        }
        if (route.screen === "sink") {
            return { eyebrow: "Fixture", title: "Sink", showBack: true };
        }
        if (route.screen === "sinks") {
            return { eyebrow: "Pick a fixture", title: "Sinks", showBack: false as const };
        }
        return { eyebrow: "Droplet", title: "Overview", showBack: false as const };
    })();

    return (
        <>
            <AmbientBackdrop />
            <div className="app">
                <header className="shell-header">
                    {header.showBack ? (
                        <button type="button" className="back-btn" onClick={goSinks} aria-label="Back to sinks">
                            ←
                        </button>
                    ) : (
                        <DropletMark />
                    )}
                    <div className="shell-header__mid">
                        <p className="eyebrow">{header.eyebrow}</p>
                        <h1 className="shell-title">{header.title}</h1>
                    </div>
                    <span aria-hidden style={{ width: 44 }} />
                </header>

                <PeriodChips value={period} onChange={setPeriod} />

                {error && (
                    <motion.div
                        className="glass-card state-msg"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {error}
                        <p style={{ marginTop: 12, fontSize: 12 }}>
                            Dev: run <code>uvicorn app.main:app --reload</code> then{" "}
                            <code>npm run dev</code> in <code>frontend/</code>, or build the UI with{" "}
                            <code>npm run build</code>.
                        </p>
                    </motion.div>
                )}

                {!error && (
                    <AnimatePresence mode="wait">
                        {route.screen === "overview" && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.28 }}
                            >
                                {loading || !summary ? (
                                    <LoadingCard />
                                ) : (
                                    <>
                                        <motion.div
                                            className="glass-card"
                                            style={{ textAlign: "center" }}
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.05 }}
                                        >
                                            {(() => {
                                                const v = formatVolumeMl(summary.total_volume_ml);
                                                return (
                                                    <>
                                                        <div className="hero-value">
                                                            {v.main}
                                                            <span style={{ fontSize: "0.42em", marginLeft: 6 }}>{v.unit}</span>
                                                        </div>
                                                        <span className="hero-unit">
                                                            {v.sub ? `${v.sub} total` : "estimated waste (all sinks)"}
                                                        </span>
                                                        <p className="hero-meta">
                                                            {summary.period_start} → {summary.period_end}
                                                        </p>
                                                    </>
                                                );
                                            })()}
                                        </motion.div>
                                        <h2 className="section-title">Flow over time</h2>
                                        <motion.div
                                            className="glass-card"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <TrendChart byDay={summary.by_day} />
                                        </motion.div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {route.screen === "sinks" && (
                            <motion.div
                                key="sinks"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.28 }}
                            >
                                {loading || !sinkList ? (
                                    <LoadingCard />
                                ) : (
                                    <>
                                        <p className="hero-meta" style={{ textAlign: "center", marginBottom: 14 }}>
                                            {sinkList.period_start} → {sinkList.period_end}
                                        </p>
                                        <ul className="sink-list">
                                            {sinkList.sinks.map((s, i) => {
                                                const v = formatVolumeMl(s.total_volume_ml);
                                                return (
                                                    <motion.li
                                                        key={s.id}
                                                        initial={{ opacity: 0, x: -12 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.06 }}
                                                    >
                                                        <button type="button" className="sink-row" onClick={() => goSink(s.id)}>
                                                            <div>
                                                                <h3>{s.name}</h3>
                                                                <p>{s.location || "Unassigned"}</p>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <div className="sink-row__amt">
                                                                    <strong>
                                                                        {v.main} {v.unit}
                                                                    </strong>
                                                                    <span>in period</span>
                                                                </div>
                                                                <span className="chev" aria-hidden>
                                                                    ›
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </motion.li>
                                                );
                                            })}
                                        </ul>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {route.screen === "sink" && (
                            <motion.div
                                key={`sink-${route.sinkId}`}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.28 }}
                            >
                                {loading || !sinkDetail ? (
                                    <LoadingCard />
                                ) : (
                                    <>
                                        <motion.div
                                            className="glass-card"
                                            style={{ textAlign: "center" }}
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            {(() => {
                                                const v = formatVolumeMl(sinkDetail.total_volume_ml);
                                                return (
                                                    <>
                                                        <div className="hero-value">
                                                            {v.main}
                                                            <span style={{ fontSize: "0.42em", marginLeft: 6 }}>{v.unit}</span>
                                                        </div>
                                                        <span className="hero-unit">wasted in this range</span>
                                                        <p className="hero-meta">
                                                            {sinkDetail.period_start} → {sinkDetail.period_end}
                                                        </p>
                                                    </>
                                                );
                                            })()}
                                        </motion.div>
                                        <h2 className="section-title">This sink over time</h2>
                                        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <TrendChart byDay={sinkDetail.by_day} />
                                        </motion.div>
                                        <h2 className="section-title">Each use</h2>
                                        <motion.ul
                                            className="event-list"
                                            initial="hidden"
                                            animate="show"
                                            variants={{
                                                hidden: {},
                                                show: { transition: { staggerChildren: 0.035 } },
                                            }}
                                        >
                                            {sinkDetail.recent_events.slice(0, 24).map((ev) => (
                                                <motion.li
                                                    key={ev.id}
                                                    className="event-row"
                                                    variants={{
                                                        hidden: { opacity: 0, y: 6 },
                                                        show: { opacity: 1, y: 0 },
                                                    }}
                                                >
                                                    <time dateTime={ev.at}>{formatDateTime(ev.at)}</time>
                                                    <strong>
                                                        {formatVolumeMl(ev.volume_ml).main} {formatVolumeMl(ev.volume_ml).unit}
                                                    </strong>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                        {sinkDetail.recent_events.length === 0 && (
                                            <p className="state-msg">No events in this window.</p>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {header.showBack === false && (
                    <nav className="bottom-nav" aria-label="Main">
                        <button
                            type="button"
                            className={`nav-tab${route.screen === "overview" ? " is-active" : ""}`}
                            onClick={goOverview}
                        >
                            <span className="nav-tab__icon" aria-hidden>
                                ◎
                            </span>
                            <span>Overview</span>
                        </button>
                        <button
                            type="button"
                            className={`nav-tab${route.screen === "sinks" ? " is-active" : ""}`}
                            onClick={goSinks}
                        >
                            <span className="nav-tab__icon" aria-hidden>
                                ≋
                            </span>
                            <span>Sinks</span>
                        </button>
                    </nav>
                )}
            </div>
        </>
    );
}

function LoadingCard() {
    return (
        <motion.div
            className="glass-card"
            style={{ height: 140 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity }}
        >
            <p className="state-msg" style={{ paddingTop: 48 }}>
                Loading…
            </p>
        </motion.div>
    );
}
