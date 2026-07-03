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
        backgroundColor: `${color}10`,
        borderColor: `${color}45`,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 7,
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          color,
          fontFamily: theme.fontFamily,
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Text>
    </View>
  );
}
