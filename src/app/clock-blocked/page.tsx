export default function ClockBlockedPage() {
  return (
    <main className="min-h-screen min-h-dvh bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xs w-full">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Shop Device Only</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Clock-in is only available on the shop device.
          <br />
          Please use the in-store tablet or computer to clock in or out.
        </p>
      </div>
    </main>
  );
}
