'use client'

import { Palette, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useThemeConfig } from '@/lib/theme-config'

export default function SettingsPage() {
  const { config: themeConfig, updateConfig: updateThemeConfig } = useThemeConfig()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Personalize a aparência e o comportamento do sistema.</p>
      </div>

      <Separator />

      <Tabs
        defaultValue="appearance"
        orientation="vertical"
        className="dark:bg-background w-full flex-row items-start rounded-xl bg-white p-2">
        <TabsList className="text-foreground flex-col gap-1 rounded-none bg-transparent px-1 py-0">
          <TabsTrigger
            value="appearance"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            <Palette className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Aparência
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            <Settings className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <div className="grow rounded-md border text-start">
          {/* Aba de Aparência */}
          <TabsContent value="appearance">
            <div className="px-4 py-3">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Tema</h3>
                  <p className="text-muted-foreground text-sm">Escolha o tema de cores para o sistema.</p>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-selector">Tema do sistema</Label>
                    <Select value={theme} onValueChange={value => setTheme(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione um tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="high-contrast">Alto contraste</Label>
                      <p className="text-muted-foreground text-[0.8rem]">
                        Aumentar o contraste para melhor legibilidade.
                      </p>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={themeConfig.highContrast}
                      onCheckedChange={(checked: boolean) => updateThemeConfig({ highContrast: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium">Acessibilidade</h3>
                  <p className="text-muted-foreground text-sm">
                    Ajuste as configurações para melhorar a acessibilidade.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduced-motion">Reduzir movimento</Label>
                      <p className="text-muted-foreground text-[0.8rem]">Reduzir ou eliminar animações na interface.</p>
                    </div>
                    <Switch
                      id="reduced-motion"
                      checked={themeConfig.reducedMotion}
                      onCheckedChange={(checked: boolean) => updateThemeConfig({ reducedMotion: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tamanho da fonte</Label>
                    <RadioGroup
                      value={themeConfig.fontSize}
                      onValueChange={(value: 'small' | 'medium' | 'large') => updateThemeConfig({ fontSize: value })}
                      className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="font-small" />
                        <Label htmlFor="font-small" className="text-sm">
                          Pequeno
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="font-medium" />
                        <Label htmlFor="font-medium" className="text-base">
                          Médio
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="font-large" />
                        <Label htmlFor="font-large" className="text-lg">
                          Grande
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Integrações */}
          <TabsContent value="integrations">
            <div className="px-4 py-3">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Integrações</h3>
                  <p className="text-muted-foreground text-sm">Configure integrações com serviços externos.</p>
                </div>
                <h3>Implementar...</h3>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
