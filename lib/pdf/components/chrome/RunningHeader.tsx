import { View } from "@react-pdf/renderer";
import type { PdfTheme } from "../../core/types";
import { flowDirection, textEnd } from "../../core/layout";
import { RunningText } from "../primitives/EditorialType";
import { SmallText } from "../primitives/Text";
import { HairlineRule } from "../primitives/HairlineRule";

interface RunningHeaderProps {
  theme: PdfTheme;
  pageLabel: string;
  candidateLine: string;
}

/** Wayfinding only — which page, whose report. Never competes with content. */
export function RunningHeader({ theme, pageLabel, candidateLine }: RunningHeaderProps) {
  return (
    <View>
      <View
        style={{
          flexDirection: flowDirection(theme),
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingBottom: theme.spacing.sm,
        }}
      >
        <RunningText theme={theme}>{pageLabel}</RunningText>
        <SmallText theme={theme} style={{ textAlign: textEnd(theme), width: 270 }}>
          {candidateLine}
        </SmallText>
      </View>
      <HairlineRule theme={theme} />
    </View>
  );
}
