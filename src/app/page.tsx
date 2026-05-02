import { SignOutButton } from "./_components/SignOutButton";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Orcistrator Maps</span>
          <SignOutButton />
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Maps</h1>
          <button
            disabled
            className="cursor-not-allowed rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white opacity-50"
            title="Coming in Epic 2"
          >
            New Map
          </button>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24 text-center">
          <p className="text-lg font-medium text-gray-900">No maps yet</p>
          <p className="mt-1 text-sm text-gray-500">Create your first map to get started.</p>
        </div>
      </main>
    </div>
  );
}
