import { CenterShell } from "@/components/center-shell";

export const runtime = "nodejs";

export default function CenterLayout({ children }: { children: React.ReactNode }) {
  return <CenterShell>{children}</CenterShell>;
}
