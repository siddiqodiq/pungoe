import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, HardDrive } from "lucide-react"

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
          <Card className="hover-effect">
            <CardHeader>
              <CardTitle>Tools Collection</CardTitle>
              <CardDescription>Kumpulan tools pentesting</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Size: 250 MB</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full gradient-btn">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover-effect">
            <CardHeader>
              <CardTitle>Config Files</CardTitle>
              <CardDescription>File konfigurasi untuk berbagai tools</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Size: 50 MB</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full gradient-btn">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover-effect">
            <CardHeader>
              <CardTitle>Scripts</CardTitle>
              <CardDescription>Koleksi script automation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Size: 10 MB</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full gradient-btn">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}