import type { SVGProps } from 'react'

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </Icon>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Icon>
  )
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
      <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
      <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
    </Icon>
  )
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </Icon>
  )
}

export function SystemIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <line x1="8" y1="20" x2="16" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
    </Icon>
  )
}

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.15 0 1.56-.01 2.81-.01 3.19 0 .31.2.67.8.56A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35 0.5 12 0.5Z" />
    </svg>
  )
}

export function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 16V4" />
      <path d="M6 10l6-6 6 6" />
      <path d="M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Icon>
  )
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 4v12" />
      <path d="M6 12l6 6 6-6" />
      <path d="M4 20h16" />
    </Icon>
  )
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  )
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 12l5 5 9-10" />
    </Icon>
  )
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </Icon>
  )
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    </Icon>
  )
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  )
}

export function FileTextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M14 2v5h5" />
      <path d="M8 12h8" />
      <path d="M8 16h8" />
      <path d="M8 8h3" />
    </Icon>
  )
}

export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 21v-5h5" />
    </Icon>
  )
}

export function AlertTriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  )
}

export function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </Icon>
  )
}

export function ArrowDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M18 13l-6 6-6-6" />
    </Icon>
  )
}

export function ChevronsUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M7 11l5-5 5 5" />
      <path d="M7 18l5-5 5 5" />
    </Icon>
  )
}

export function ChevronsDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M7 6l5 5 5-5" />
      <path d="M7 13l5 5 5-5" />
    </Icon>
  )
}

export function GripVerticalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  )
}

export function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 13l9 5 9-5" />
    </Icon>
  )
}

export function MaximizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M8 3H4v4" />
      <path d="M16 3h4v4" />
      <path d="M8 21H4v-4" />
      <path d="M16 21h4v-4" />
    </Icon>
  )
}

export function MinimizeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 8V4h4" />
      <path d="M20 8V4h-4" />
      <path d="M4 16v4h4" />
      <path d="M20 16v4h-4" />
    </Icon>
  )
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Icon>
  )
}

export function WrapTextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <path d="M4 12h13a3 3 0 0 1 0 6h-4" />
      <path d="M15 15l-2 3 2 3" />
      <line x1="4" y1="18" x2="9" y2="18" />
    </Icon>
  )
}

export function SpellcheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 16l4-10 4 10" />
      <path d="M5.5 12.5h5" />
      <path d="M14 12l3 3 5-6" />
    </Icon>
  )
}

export function UndoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M9 7 4 12l5 5" />
      <path d="M4 12h11a5 5 0 0 1 0 10h-1" />
    </Icon>
  )
}

export function RedoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M15 7l5 5-5 5" />
      <path d="M20 12H9a5 5 0 0 0 0 10h1" />
    </Icon>
  )
}

export function MoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function ColumnsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </Icon>
  )
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  )
}

export function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  )
}

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </Icon>
  )
}

export function PrinterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <path d="M6 17h12v4H6z" />
    </Icon>
  )
}
