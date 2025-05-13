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
      <div className="relative w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search database..."
          className="pl-10 w-full md:w-[300px] hover-input"
        />
      </div>
    </div>
  )
}