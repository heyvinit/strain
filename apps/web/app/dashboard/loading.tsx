export default function DashboardLoading() {
  return (
    <div className="px-5 pt-14 pb-10 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-20 rounded-lg bg-gray-200" />
        <div className="h-8 w-16 rounded-full bg-gray-200" />
      </div>
      {/* Passport card skeleton */}
      <div className="rounded-3xl bg-gray-100 mb-6" style={{ height: 340 }} />
      {/* Race grid skeleton */}
      <div className="h-4 w-20 rounded bg-gray-200 mb-3" />
      <div className="grid grid-cols-2 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-100" style={{ aspectRatio: '3/4' }} />
        ))}
      </div>
    </div>
  )
}
