import { ReactNode } from "react";
import { LAYOUT } from "./tokens";

interface SectionLayoutProps {
  contextualSidebar?: ReactNode;
  children: ReactNode;
}

export default function SectionLayout({ contextualSidebar, children }: SectionLayoutProps) {
  return (
    <>
      {contextualSidebar && (
        <div style={{
          width: LAYOUT.contextualSidebarWidth,
          background: LAYOUT.bgWhite,
          borderRight: `1px solid ${LAYOUT.borderLight}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {contextualSidebar}
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </div>
    </>
  );
}
