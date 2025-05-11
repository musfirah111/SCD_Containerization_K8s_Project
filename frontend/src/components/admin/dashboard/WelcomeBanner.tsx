export function WelcomeBanner() {
  return (
    <div className="bg-gradient-to-r from-[#7BC1B7] to-[#0B8FAC] rounded-lg p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-2">Welcome Back, Dr. Smith</h1>
        <p className="text-white/90 mb-4">Here's what's happening with your hospital today</p>
        <div className="flex gap-4">

        </div>
      </div>
      <div className="absolute right-0 bottom-0 opacity-10">
        <svg className="w-48 h-48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
        </svg>
      </div>
    </div>
  );
}