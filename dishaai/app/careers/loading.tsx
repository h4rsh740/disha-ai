export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-[3px] border-[#1a2e5a] border-t-[#0ea5e9] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-[#475569]">Loading career matches...</p>
      </div>
    </div>
  );
}
