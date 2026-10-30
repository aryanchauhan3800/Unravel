import type { ReactElement, ReactNode } from "react";

import { useTheme } from "../theme";
import { Icon } from "../components/ui";

export type StepStatus = "complete" | "active" | "pending";

/** The steps an agent took, folded under one line: its icon, what it's doing, and a chevron to open or close them. */
export function ChainOfThought({ label, open, onToggle, running = false, children }: {
  readonly label: string;
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly running?: boolean;
  readonly children: ReactNode;
}): ReactElement {
  const { p } = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", borderWidth: 1, borderColor: running ? p.line2 : p.line3, borderRadius: 10, padding: 10, backgroundColor: running ? p.raised : p.fill }}>
      <div onClick={onToggle} role="button" aria-expanded={open} aria-label={label} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", fontSize: 13, color: running ? p.text : p.muted, cursor: "pointer", hover: { opacity: 0.72 } }}>
        <Icon name={running ? "working" : "check"} size={15} color={running ? p.primary : p.string || p.muted} />
        <div style={{ fontWeight: 700, fontSize: 11, color: running ? p.primary : p.text3 }}>
          {running ? "INVESTIGATING" : "ANALYSIS COMPLETE"}
        </div>
        <div style={{ flexGrow: 1, minWidth: 0, fontSize: 12, color: p.faint, marginLeft: 2 }}>{label}</div>
        <Icon name={open ? "collapse" : "disclosure"} size={15} color={p.muted} />
      </div>
      {open && <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>{children}</div>}
    </div>
  );
}

/** One step: an icon on a line that runs down to the next step, the label, a quieter description, and anything it found. */
export function ChainOfThoughtStep({ icon, label, description, status, tone = null, children }: {
  readonly icon: string | null;
  readonly label: ReactNode;
  readonly description?: ReactNode;
  readonly status: StepStatus;
  readonly tone?: string | null;
  readonly children?: ReactNode;
}): ReactElement {
  const { p } = useTheme();
  const color = tone ?? (status === "active" ? p.text : p.muted);
  const stepIcon = status === "complete" ? "check" : icon;
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13.5, color, ...(status === "pending" ? { opacity: 0.5 } : {}) }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0, marginTop: 2 }}>
        {stepIcon ? (
          <Icon name={stepIcon} size={15} color={status === "complete" ? (p.string || p.muted) : color} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
            <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
          </div>
        )}
        <div style={{ position: "absolute", top: 26, bottom: 0, left: 7.5, width: 1, backgroundColor: p.line2 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexGrow: 1, minWidth: 0, overflow: "hidden" }}>
        <div>{label}</div>
        {description && <div style={{ fontSize: 12, color: p.muted }}>{description}</div>}
        {children}
      </div>
    </div>
  );
}

/** What a step turned up, as small badges; each can be clicked when it names something you can open. */
export function ChainOfThoughtResults({ items, onPick }: { readonly items: readonly string[]; readonly onPick: ((item: string) => void) | null }): ReactElement {
  const { p } = useTheme();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      {items.map((item) => (
        <div key={item} {...(onPick ? { onClick: () => onPick(item), role: "button" } : {})} aria-label={item} style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, borderRadius: 6, backgroundColor: p.fill2, fontSize: 12, color: p.text3, whiteSpace: "nowrap", ...(onPick ? { cursor: "pointer", hover: { opacity: 0.72 } } : {}) }}>
          {item}
        </div>
      ))}
    </div>
  );
}
