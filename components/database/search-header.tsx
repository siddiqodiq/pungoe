import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export const SearchHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">Security Database</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Akses koleksi CVE, payload templates, dan wordlists untuk pentesting
        </p>
      </div>
    </div>
  )
}