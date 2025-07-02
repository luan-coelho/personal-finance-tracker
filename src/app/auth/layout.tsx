export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br">
      {children}
    </div>
  )
}
