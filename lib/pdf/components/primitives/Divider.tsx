import { View } from "@react-pdf/renderer";
import type { PdfTheme } from "../../core/types";

interface DividerProps {
  theme: PdfTheme;
  spacing?: number;
}

export function Divider({ theme, spacing = 12 }: DividerProps) {
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme.border.default,
        marginVertical: spacing,
      }}
    />
  );
}
