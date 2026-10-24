export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-rose" />
        <p className="label-nav text-paper/50">Loading</p>
      </div>
    </div>
  );
}
