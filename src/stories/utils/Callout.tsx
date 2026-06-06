import type { CSSProperties, ReactNode } from "react";

type Tone = "info" | "note" | "success";

interface CalloutProps {
  /** Bold heading shown at the top of the callout. */
  title: string;
  /** Explanatory body — what the story demonstrates / what the test does. */
  children: ReactNode;
  /** Visual treatment. Defaults to "info" (blue). */
  tone?: Tone;
}

const TONES: Record<
  Tone,
  {
    bg: string;
    border: string;
    accent: string;
    title: string;
    body: string;
    codeBg: string;
    codeBorder: string;
    icon: ReactNode;
  }
> = {
  info: {
    bg: "#eff6ff",
    border: "#bfdbfe",
    accent: "#2563eb",
    title: "#1e3a8a",
    body: "#1e40af",
    codeBg: "rgba(37, 99, 235, 0.10)",
    codeBorder: "rgba(37, 99, 235, 0.22)",
    icon: (
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 12 7Zm1.25 10h-2.5v-1.25h.625V11.5h-.625V10.25h1.875V15.75h.625V17Z"
      />
    ),
  },
  note: {
    bg: "#fffbeb",
    border: "#fde68a",
    accent: "#d97706",
    title: "#92400e",
    body: "#b45309",
    codeBg: "rgba(217, 119, 6, 0.12)",
    codeBorder: "rgba(217, 119, 6, 0.26)",
    icon: (
      <path
        fill="currentColor"
        d="M12 2 1 21h22L12 2Zm0 6a1.1 1.1 0 0 1 1.1 1.1v5.4a1.1 1.1 0 0 1-2.2 0V9.1A1.1 1.1 0 0 1 12 8Zm0 9.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"
      />
    ),
  },
  success: {
    bg: "#ecfdf5",
    border: "#a7f3d0",
    accent: "#059669",
    title: "#065f46",
    body: "#047857",
    codeBg: "rgba(5, 150, 105, 0.12)",
    codeBorder: "rgba(5, 150, 105, 0.26)",
    icon: (
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.1 14.3-4-4 1.4-1.4 2.6 2.6 5.4-5.4 1.4 1.4-6.8 6.8Z"
      />
    ),
  },
};

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 16px",
  marginBottom: 16,
  borderRadius: 10,
  borderWidth: 1,
  borderStyle: "solid",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  lineHeight: 1.5,
};

const codeChipStyle = `
.yasml-callout code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 0.85em;
  padding: 0.12em 0.4em;
  margin: 0 0.05em;
  border-radius: 5px;
  background: var(--yasml-code-bg);
  border: 1px solid var(--yasml-code-border);
  color: var(--yasml-code-fg);
  white-space: nowrap;
}
`;

export function Callout({ title, children, tone = "info" }: CalloutProps) {
  const t = TONES[tone];
  const codeVars = {
    "--yasml-code-bg": t.codeBg,
    "--yasml-code-border": t.codeBorder,
    "--yasml-code-fg": t.title,
  } as CSSProperties;
  return (
    <div
      role="note"
      className="yasml-callout"
      style={{ ...containerStyle, ...codeVars, background: t.bg, borderColor: t.border }}
    >
      <style>{codeChipStyle}</style>
      <svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ flexShrink: 0, marginTop: 1, color: t.accent }}
      >
        {t.icon}
      </svg>
      <div>
        <div style={{ fontWeight: 600, color: t.title, marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ color: t.body, fontSize: 14 }}>{children}</div>
      </div>
    </div>
  );
}
