import { Text, View } from "@react-pdf/renderer";
import type { PdfTheme } from "../../core/types";

interface BadgeProps {
  children: string;
  theme: PdfTheme;
  color?: string;
}

export function Badge({ children, theme, color = theme.brand.primary }: BadgeProps) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: `${color}18`,
        borderColor: `${color}55`,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          color,
          fontFamily: theme.fontFamily,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Text>
    </View>
  );
}
