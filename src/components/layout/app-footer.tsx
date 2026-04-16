export function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t px-4 py-3 backdrop-blur">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>© {currentYear} - Desenvolvido por Luan Coelho</span>
      </div>
    </footer>
  )
}
