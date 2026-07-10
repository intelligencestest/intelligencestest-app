export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc", color: "#e2e8f0" }}>
      {children}
    </div>
  );
}
