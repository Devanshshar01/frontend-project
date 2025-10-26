interface StatusBarProps {
  fileName?: string;
  language?: string;
  lineNumber?: number;
  column?: number;
  totalLines?: number;
}

export function StatusBar({ fileName, language, lineNumber, column, totalLines }: StatusBarProps) {
  return (
    <div className="h-6 bg-[#007acc] flex items-center justify-between px-4 text-xs text-white select-none">
      <div className="flex items-center gap-4">
        <span className="font-semibold">VS Code Clone</span>
        {fileName && (
          <span className="text-white/90">
            {fileName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {language && (
          <span className="px-2 py-0.5 bg-white/20 rounded capitalize">
            {language}
          </span>
        )}
        {lineNumber !== undefined && column !== undefined && (
          <span>
            Ln {lineNumber}, Col {column}
          </span>
        )}
        {totalLines !== undefined && (
          <span className="text-white/90">
            {totalLines} lines
          </span>
        )}
      </div>
    </div>
  );
}
