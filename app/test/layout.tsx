import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#07080F", color: "#e2e8f0" }}>
      <div className="fixed right-4 top-[72px] z-[70]">
        <LanguageSwitcher variant="candidate" preserveLangParam showLabel={false} />
      </div>
      {children}
    </div>
  );
}
