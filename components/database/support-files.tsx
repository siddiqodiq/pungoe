// components/SupportFiles.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, HardDrive, ExternalLink } from "lucide-react"
import { supportFiles } from "@/lib/support-files"

export const SupportFiles = () => {
  return (
    <Card className="glass-effect hover-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-6 w-6" /> Support Files
        </CardTitle>
        <CardDescription>File-file pendukung untuk pentesting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {supportFiles.map((file) => (
            <Card key={file.id} className="hover-effect">
              <CardHeader>
                <CardTitle>{file.title}</CardTitle>
                <CardDescription>{file.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span>Source: {file.source}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gradient-btn"
                  asChild
                >
                  <a 
                    href={file.downloadUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}