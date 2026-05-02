interface MapEditorPageProps {
  params: { projectId: string };
}

export default function MapEditorPage({ params }: MapEditorPageProps) {
  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white">
      <header className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <span className="text-sm font-medium">Map Editor</span>
        <span className="font-mono text-xs text-gray-400">{params.projectId}</span>
      </header>
      <div className="flex flex-1 items-center justify-center text-gray-500">
        Canvas coming in Epic 4
      </div>
    </div>
  );
}
