import { coverageStatusLabel, valueStatusLabel } from "@/lib/observatory/format";
import { metricBadgeLabel } from "@/lib/observatory/metrics";
import type { CoverageStatus, MetricReviewStatus, ValueStatus } from "@/schemas/v1/normalized";
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
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "border-navy/20 bg-white text-navy",
        tone === "warn" && "border-amber-800/30 bg-amber-50 text-amber-950",
        tone === "ok" && "border-teal-800/25 bg-teal-50 text-teal-950",
        tone === "mute" && "border-dashed border-navy/30 bg-obs-paper text-navy/70",
      )}
    >
      {children}
    </span>
  );
}

export function CoveragePill({ status }: { status: CoverageStatus }) {
  const tone =
    status === "available" ? "ok" : status === "not_supplied" || status === "screened_out" ? "mute" : "warn";
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
        : status === "unknown" || status === "structurally_unavailable" || status === "not_applicable"
          ? "mute"
          : "warn";
  return (
    <Pill tone={tone}>
      <StatusMark status={status} />
      {valueStatusLabel(status)}
    </Pill>
  );
}

export function MetricPill({ status }: { status: MetricReviewStatus }) {
  const tone =
    status === "cleared" ? "ok" : status === "provisional" ? "warn" : "mute";
  return (
    <Pill tone={tone}>
      <StatusMark status={status} />
      {metricBadgeLabel(status)}
    </Pill>
  );
}

function StatusMark({ status }: { status: string }) {
  const symbol =
    status === "available" || status === "recorded" || status === "cleared"
      ? "●"
      : status === "zero"
        ? "0"
        : status === "unknown" || status === "not_supplied" || status === "ineligible"
          ? "○"
          : status === "provisional" || status === "partial" || status === "fixture_only"
            ? "△"
            : "□";
  return <span aria-hidden>{symbol}</span>;
}

export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-navy/25 bg-white px-5 py-8">
      <p className="font-serif text-lg text-navy">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-navy/70">{children}</div>
    </div>
  );
}
