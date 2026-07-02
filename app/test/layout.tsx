export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#07080F", color: "#e2e8f0" }}>
      {children}
    </div>
  );
}
