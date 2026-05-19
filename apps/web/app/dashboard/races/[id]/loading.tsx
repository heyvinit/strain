export default function RaceDetailLoading() {
  return (
    <div className="px-5 pt-14 pb-8 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="h-5 w-32 rounded-lg bg-gray-200" />
      </div>
      {/* Race ticket skeleton */}
      <div className="rounded-3xl bg-gray-900" style={{ height: 280 }} />
      {/* Photo grid skeleton */}
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl bg-gray-200" style={{ aspectRatio: '1/1' }} />
        ))}
      </div>
    </div>
  )
}
