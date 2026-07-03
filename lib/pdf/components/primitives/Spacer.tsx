import { View } from "@react-pdf/renderer";

interface SpacerProps {
  size?: number;
}

export function Spacer({ size = 12 }: SpacerProps) {
  return <View style={{ height: size }} />;
}
