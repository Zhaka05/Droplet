import { motion } from "framer-motion";

export function DropletMark() {
    return (
        <div className="droplet-mark" aria-hidden>
            <motion.svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="dropletFill" x1="12" y1="4" x2="38" y2="52" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#67e8f9" />
                        <stop offset="1" stopColor="#0284c7" />
                    </linearGradient>
                </defs>
                <motion.path
                    d="M24 4C16 18 8 26 8 36c0 8.8 7.2 16 16 16s16-7.2 16-16c0-10-8-18-16-32z"
                    fill="url(#dropletFill)"
                    initial={{ y: 0 }}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <ellipse cx="22" cy="34" rx="5" ry="7" fill="white" fillOpacity="0.25" />
            </motion.svg>
        </div>
    );
}
