// data/supportFiles.ts
export interface SupportFile {
  id: string
  title: string
  description: string
  source: string
  downloadUrl: string
}

export const supportFiles: SupportFile[] = [
  {
    id: "SF-001",
    title: "Tools Collection",
    description: "Kumpulan tools pentesting",
    source: "GitHub",
    downloadUrl: "https://github.com/tools-collection/pentesting-tools/releases/latest"
  },
  {
    id: "SF-002",
    title: "Config Files",
    description: "File konfigurasi untuk berbagai tools",
    source: "GitLab",
    downloadUrl: "https://gitlab.com/security-configs/standard-configs/-/releases"
  },
  {
    id: "SF-003",
    title: "Scripts",
    description: "Koleksi script automation",
    source: "Bitbucket",
    downloadUrl: "https://bitbucket.org/security-scripts/main/downloads/"
  },
]