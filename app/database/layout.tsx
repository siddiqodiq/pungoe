import { RouteGuard } from '@/components/route-guard'
import './database.css'

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="database-container">
        <RouteGuard requireAuth>
      {children}
      </RouteGuard>
    </div>

  )
}