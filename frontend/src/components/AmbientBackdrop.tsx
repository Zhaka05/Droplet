import { motion } from "framer-motion";

const blobs = [
    { cx: "20%", cy: "15%", r: 180, color: "#0369a1", delay: 0 },
    { cx: "85%", cy: "25%", r: 220, color: "#0e7490", delay: 2 },
    { cx: "50%", cy: "70%", r: 200, color: "#164e63", delay: 4 },
];

export function AmbientBackdrop() {
    return (
        <div className="ambient" aria-hidden>
            {blobs.map((b, i) => (
                <motion.div
                    key={i}
                    className="ambient__blob"
                    style={{
                        left: b.cx,
                        top: b.cy,
                        width: b.r,
                        height: b.r,
                        marginLeft: -b.r / 2,
                        marginTop: -b.r / 2,
                        background: b.color,
                    }}
                    animate={{
                        x: [0, 24, -16, 0],
                        y: [0, -18, 12, 0],
                        scale: [1, 1.08, 0.96, 1],
                    }}
                    transition={{
                        duration: 18 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: b.delay,
                    }}
                />
            ))}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(56,189,248,0.12), transparent 55%)",
                }}
            />
        </div>
    );
}
