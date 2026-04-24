import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

type StatGradient = "purple" | "cyan" | "green" | "amber";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    icon: LucideIcon;
    gradient: StatGradient;
    trend?: number; // percent change, e.g. +12 or -3
    delay?: number;
}

const gradientMap: Record<StatGradient, string> = {
    purple: "stat-gradient-purple",
    cyan: "stat-gradient-cyan",
    green: "stat-gradient-green",
    amber: "stat-gradient-amber",
};

const iconMap: Record<StatGradient, string> = {
    purple: "icon-glow-purple",
    cyan: "icon-glow-cyan",
    green: "icon-glow-green",
    amber: "icon-glow-amber",
};

export default function StatsCard({
    title,
    value,
    subtext,
    icon: Icon,
    gradient,
    trend,
    delay = 0,
}: StatsCardProps) {
    const delayClass = delay ? `delay-${delay}` : "";
    const isPositive = trend !== undefined && trend >= 0;

    return (
        <div
            className={`fade-in-up ${delayClass} hover-lift rounded-2xl p-5 border border-border/60 ${gradientMap[gradient]} flex flex-col gap-4`}
        >
            {/* Top Row */}
            <div className="flex items-start justify-between">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${iconMap[gradient]}`}>
                    <Icon className="h-5 w-5" />
                </div>

                {trend !== undefined && (
                    <span
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-400"
                            }`}
                    >
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>

            {/* Value */}
            <div>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
                {subtext && (
                    <p className="text-xs text-muted-foreground/70 mt-1">{subtext}</p>
                )}
            </div>
        </div>
    );
}
