export default function PublicPassportLoading() {
  return (
    <div
      className="min-h-screen animate-pulse"
      style={{ background: '#1a1a1a' }}
    >
      <div className="px-5 pt-10 pb-16 flex flex-col items-center">
        <div className="w-full max-w-[420px]">
          {/* Passport card skeleton */}
          <div className="rounded-3xl mb-6" style={{ height: 420, background: '#2a2a2a' }} />
          {/* Race grid skeleton */}
          <div className="h-3 w-16 rounded mb-3" style={{ background: '#2a2a2a' }} />
          <div className="grid grid-cols-2 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl" style={{ aspectRatio: '3/4', background: '#2a2a2a' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
