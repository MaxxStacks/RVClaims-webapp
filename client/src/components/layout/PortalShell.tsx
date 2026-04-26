import { ReactNode } from "react";
import AppBar from "@/components/AppBar";
import { LAYOUT } from "./tokens";

interface PortalShellProps {
  context: "operator" | "dealer" | "client" | "bidder";
  mainNav: ReactNode;
  children: ReactNode;
  contextLabel?: string;
}

export default function PortalShell({ context, mainNav, children, contextLabel }: PortalShellProps) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: LAYOUT.bgPage }}>
      {/* Layer 1a — Main nav sidebar (full height, fixed width) */}
      <div style={{
        width: LAYOUT.mainNavWidth,
        background: LAYOUT.bgWhite,
        borderRight: `1px solid ${LAYOUT.borderLight}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {mainNav}
      </div>

      {/* Right side: AppBar on top, content below */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {/* Layer 1b — AppBar (sits above content area only) */}
        <AppBar context={context} contextLabel={contextLabel} />
        {/* Content area */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
