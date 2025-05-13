import './database.css'

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="database-container">
      {children}
    </div>
  )
}