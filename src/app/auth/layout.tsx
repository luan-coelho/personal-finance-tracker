export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-svh items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-lg leading-6 font-semibold tracking-[-0.01em]">Família Coelho</span>
          <span className="text-muted-foreground text-sm leading-5">Gestão financeira</span>
        </div>
        {children}
      </div>
    </div>
  )
}
