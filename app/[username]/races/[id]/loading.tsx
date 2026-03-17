export default function PublicRaceDetailLoading() {
  return (
    <div
      className="min-h-screen px-5 pt-14 pb-8"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.32)' }} />
      <div className="relative z-10 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="h-5 w-28 rounded-lg" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div className="rounded-3xl mb-4" style={{ height: 280, background: 'rgba(255,255,255,0.08)' }} />
        <div className="grid grid-cols-3 gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl" style={{ aspectRatio: '1/1', background: 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
