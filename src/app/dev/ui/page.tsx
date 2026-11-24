import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { ThemeToggle } from '@/components/layout/theme-toggle'

import { DisplaySection } from './_sections/display'
import { FormsSection } from './_sections/forms'
import { SelectionSection } from './_sections/selection'
import { ShellSection } from './_sections/shell'

export const metadata: Metadata = {
  title: 'Vitrine Radar',
  robots: { index: false, follow: false },
}

function ShowcaseSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col gap-6">
      <h2 id={`${id}-title`} className="border-border border-b pb-3 text-xl leading-7 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Vitrine temporária dos componentes Radar. Só existe em desenvolvimento. */
export default function DevUiPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return (
    <main className="bg-background text-foreground min-h-svh">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl leading-8 font-semibold tracking-[-0.01em]">Vitrine Radar</h1>
            <p className="text-muted-foreground text-sm leading-5">
              Componentes do redesenho · página temporária, só em desenvolvimento
            </p>
          </div>
          <ThemeToggle />
        </header>

        <ShowcaseSection id="shell" title="Shell">
          <ShellSection />
        </ShowcaseSection>
        <ShowcaseSection id="forms" title="Formulários">
          <FormsSection />
        </ShowcaseSection>
        <ShowcaseSection id="selection" title="Seleção">
          <SelectionSection />
        </ShowcaseSection>
        <ShowcaseSection id="display" title="Exibição">
          <DisplaySection />
        </ShowcaseSection>
      </div>
    </main>
  )
}
