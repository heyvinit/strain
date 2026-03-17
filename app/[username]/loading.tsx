export default function PublicPassportLoading() {
  return (
    <main
      className="min-h-screen flex flex-col items-center px-5 py-10 relative"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.32)' }} />

      <div
        className="relative z-10 w-full max-w-[420px] rounded-[28px] px-5 pt-7 pb-8 animate-pulse"
        style={{
          background: 'rgba(253,251,244,0.95)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.45), 0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Passport card skeleton */}
        <div className="rounded-3xl mb-6" style={{ height: 420, background: 'rgba(0,0,0,0.07)' }} />
        {/* Race grid skeleton */}
        <div className="h-3 w-16 rounded mb-3" style={{ background: 'rgba(0,0,0,0.07)' }} />
        <div className="grid grid-cols-2 gap-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl" style={{ aspectRatio: '3/4', background: 'rgba(0,0,0,0.07)' }} />
          ))}
        </div>
      </div>
    </main>
  )
}
