import { Text, View } from "@react-pdf/renderer";
import { EDITORIAL } from "../../core/theme";

interface VerdictMarkProps {
  word: string;
  /** The page's own (enlarged) top padding — the mark fills exactly this reserved band, never past it into the running header. */
  topPadding: number;
}

/**
 * The signature moment. The only element in the entire report allowed to
 * bleed past the margins — and only here, only on the Hiring Decision page.
 * Always one of PROCEED / CAUTION / DECLINE, always this pale, always this
 * scale: the mark's job is recognition, not news. It gets no more excited
 * about good news, and no more alarmed by bad news.
 *
 * Absolutely-positioned Page children are placed relative to the page's true
 * physical edge in react-pdf, ignoring the Page's own padding entirely — so
 * this uses plain positive coordinates from that edge, not a negative offset.
 */
export function VerdictMark({ word, topPadding }: VerdictMarkProps) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: topPadding - 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: EDITORIAL.ink,
          fontFamily: EDITORIAL.serif,
          fontSize: 76,
          lineHeight: 1.15,
          letterSpacing: 3,
          opacity: 0.12,
        }}
      >
        {word}
      </Text>
    </View>
  );
}
