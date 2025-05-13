import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export const WordlistTable = ({ data }: { data: any[] }) => {
  return (
    <ScrollArea className="h-[400px] md:h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[80px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="min-w-[100px]">Type</TableHead>
            <TableHead className="min-w-[100px]">Entries</TableHead>
            <TableHead className="min-w-[80px]">Size</TableHead>
            <TableHead className="min-w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((wordlist) => (
            <TableRow key={wordlist.id}>
              <TableCell className="font-medium">{wordlist.id}</TableCell>
              <TableCell className="max-w-[200px] truncate">{wordlist.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{wordlist.type}</Badge>
              </TableCell>
              <TableCell>{wordlist.entries}</TableCell>
              <TableCell>{wordlist.size}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" /> <span className="hidden md:inline">Download</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}