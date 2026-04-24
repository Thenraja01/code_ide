export default function LivePreview({ previewUrl }: { previewUrl: string | null }) {
  if (!previewUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-gray-400">
        Waiting for sandbox to start...
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white relative">
      <div className="bg-[#2d2d2d] h-10 w-full flex items-center px-4 border-b border-[#1e1e1e]">
         <div className="text-xs text-gray-400 truncate max-w-full bg-[#1e1e1e] px-3 py-1 rounded">
           {previewUrl}
         </div>
      </div>
      <iframe
        src={previewUrl}
        className="w-full h-[calc(100%-2.5rem)] border-none"
        title="Live Preview"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
}
