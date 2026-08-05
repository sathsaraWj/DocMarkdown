import type { MergePdfProgress, MergePdfStage } from '@/types/mergePdf'

const STAGE_LABEL: Record<MergePdfStage, string> = {
  reading: 'Reading files',
  preparing: 'Preparing document',
  copying: 'Copying pages',
  finalizing: 'Finalizing PDF',
  downloading: 'Preparing download',
  complete: 'Complete',
}

interface MergeProgressProps {
  progress: MergePdfProgress | null
}

export function MergeProgress({ progress }: MergeProgressProps) {
  if (!progress) return null

  const stageLabel = STAGE_LABEL[progress.stage]
  const position = progress.stage === 'complete' ? progress.totalFiles : progress.currentFileIndex + 1

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-2 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-800 dark:text-neutral-100">{stageLabel}</span>
        <span className="text-neutral-500 dark:text-neutral-400">{progress.percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Merge progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
      >
        <div
          className="h-full rounded-full bg-accent-600 transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        File {Math.min(position, progress.totalFiles)} of {progress.totalFiles}
        {progress.currentFileName ? ` — ${progress.currentFileName}` : ''}
      </p>
    </div>
  )
}
