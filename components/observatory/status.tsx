import {
  coverageStatusLabel,
  valueStatusLabel,
} from "@/lib/observatory/format";
import { metricBadgeLabel } from "@/lib/observatory/metrics";
import type {
  CoverageStatus,
  MetricReviewStatus,
  ValueStatus,
} from "@/schemas/v1/normalized";
import { cn } from "@/lib/cn";

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn" | "ok" | "mute";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tone === "neutral" && "border-navy/15 bg-white text-navy",
        tone === "warn" && "border-amber-800/30 bg-amber-50 text-amber-950",
        tone === "ok" && "border-accent/70 bg-accent text-accent-ink",
        tone === "mute" && "border-dashed border-navy/30 bg-mist text-navy/70",
      )}
    >
      {children}
    </span>
  );
}

export function CoveragePill({ status }: { status: CoverageStatus }) {
  const tone =
    status === "available"
      ? "ok"
      : status === "not_supplied" || status === "screened_out"
        ? "mute"
        : "warn";
  return (
    <Pill tone={tone}>
      <StatusMark status={status} />
      {coverageStatusLabel(status)}
    </Pill>
  );
}

export function ValuePill({ status }: { status: ValueStatus }) {
  const tone =
    status === "recorded"
      ? "ok"
      : status === "zero"
        ? "neutral"
        : status === "unknown" ||
            status === "structurally_unavailable" ||
            status === "not_applicable"
          ? "mute"
          : "warn";
  return (
    <Pill tone={tone}>
      <StatusMark status={status} />
      {valueStatusLabel(status)}
    </Pill>
  );
}

export function MetricPill({
  status,
  kind = "competition_index",
  scoreGate = null,
}: {
  status: MetricReviewStatus;
  kind?: string;
  scoreGate?: boolean | null;
}) {
  if (
    status === "cleared" &&
    (kind !== "competition_index" || scoreGate !== true)
  )
    status = "provisional";
  const tone =
    status === "cleared" ? "ok" : status === "provisional" ? "warn" : "mute";
  return (
    <Pill tone={tone}>
      <StatusMark status={status} />
      {kind === "competition_index"
        ? metricBadgeLabel(status)
        : `${status.charAt(0).toUpperCase() + status.slice(1)} volatility`}
    </Pill>
  );
}

function StatusMark({ status }: { status: string }) {
  const symbol =
    status === "available" || status === "recorded" || status === "cleared"
      ? "●"
      : status === "zero"
        ? "0"
        : status === "unknown" ||
            status === "not_supplied" ||
            status === "ineligible"
          ? "○"
          : status === "provisional" ||
              status === "partial" ||
              status === "fixture_only"
            ? "△"
            : "□";
  return <span aria-hidden>{symbol}</span>;
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="circuit-panel rounded-2xl border border-dashed border-navy/20 px-5 py-8">
      <p className="obs-heading text-lg">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}
