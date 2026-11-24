'use client'

import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button, IconButton } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Chip } from '@/components/ui/chip'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SelectionButton } from '@/components/ui/selection-button'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const buttonVariantList = ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
const buttonSizeList = ['sm', 'md', 'lg'] as const
const variantLabels: Record<(typeof buttonVariantList)[number], string> = {
  primary: 'Salvar',
  secondary: 'Duplicar',
  outline: 'Cancelar',
  ghost: 'Limpar',
  destructive: 'Excluir transação',
  link: 'Ver detalhes',
}

const categories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação']

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base leading-6 font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground text-xs font-medium">{children}</span>
}

type DemoValues = {
  description: string
  amount: string
  notes: string
}

function FormDemo() {
  const form = useForm<DemoValues>({
    defaultValues: { description: '', amount: '', notes: '' },
    mode: 'onTouched',
  })
  const [saved, setSaved] = useState<DemoValues | null>(null)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(values => setSaved(values))}
        className="flex max-w-xl flex-col gap-4"
        noValidate>
        <FormField
          control={form.control}
          name="description"
          rules={{ required: 'Informe a descrição, como "Supermercado"' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormDescription>Aparece na lista de transações.</FormDescription>
              <FormControl>
                <Input placeholder="Ex.: Supermercado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          rules={{ required: 'Informe o valor, como 120,00' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <CurrencyInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Observações <span className="text-muted-foreground text-[13px] font-normal">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Textarea maxLength={200} placeholder="Ex.: dividido com a família" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Salvar
          </Button>
        </div>
        {saved ? (
          <p className="text-muted-foreground text-sm">
            Enviado: {saved.description} · R$ {saved.amount}
          </p>
        ) : null}
      </form>
    </Form>
  )
}

export function FormsSection() {
  const [pressed, setPressed] = useState(true)
  const [segment, setSegment] = useState('month')
  const [category, setCategory] = useState('Alimentação')
  const [chips, setChips] = useState(['Mercado', 'Farmácia', 'Combustível'])
  const [selectedChip, setSelectedChip] = useState('Todas')
  const [amount, setAmount] = useState('1.234,56')
  const [loading, setLoading] = useState(false)

  return (
    <div className="flex flex-col gap-10">
      <Block title="Button · variantes e tamanhos">
        <div className="flex flex-col gap-4">
          {buttonSizeList.map(size => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              <span className="w-8">
                <Caption>{size}</Caption>
              </span>
              {buttonVariantList.map(variant => (
                <Button key={variant} variant={variant} size={size}>
                  {variantLabels[variant]}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </Block>

      <Block title="Button · ícone, carregamento e desabilitado">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" icon="plus">
            Nova transação
          </Button>
          <Button icon="download">Exportar</Button>
          <Button variant="ghost" iconRight="chevron-down">
            Mais opções
          </Button>
          <Button variant="secondary" size="lg" icon="copy">
            Duplicar orçamento
          </Button>
          <Button variant="primary" loading>
            Salvando
          </Button>
          <Button loading>Exportando</Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 1500)
            }}>
            {loading ? 'Salvando' : 'Clique para salvar'}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {buttonVariantList.map(variant => (
            <Button key={variant} variant={variant} disabled>
              {variantLabels[variant]}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="link">
            <a href="#forms">Link com asChild</a>
          </Button>
          <Button asChild icon="arrow-right">
            <a href="#forms">Âncora com ícone</a>
          </Button>
        </div>
      </Block>

      <Block title="IconButton">
        {buttonSizeList.map(size => (
          <div key={size} className="flex flex-wrap items-center gap-3">
            <span className="w-8">
              <Caption>{size}</Caption>
            </span>
            <IconButton icon="more-horizontal" label="Mais ações" size={size} />
            <IconButton icon="pencil" label="Editar" variant="outline" size={size} />
            <IconButton icon="plus" label="Adicionar" variant="primary" size={size} />
            <IconButton icon="copy" label="Duplicar" variant="secondary" size={size} />
            <IconButton icon="trash" label="Excluir" variant="destructive" size={size} />
            <IconButton icon="refresh" label="Atualizar" variant="outline" size={size} loading />
            <IconButton icon="x" label="Fechar" size={size} disabled />
          </div>
        ))}
      </Block>

      <Block title="Spinner">
        <div className="text-primary flex items-center gap-4">
          <Spinner />
          <Spinner size={20} />
          <Spinner size={24} label="Carregando" />
          <span className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner /> Carregando transações
          </span>
        </div>
      </Block>

      <Block title="Input">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="demo-default">Padrão</FieldLabel>
            <Input id="demo-default" placeholder="Ex.: Supermercado" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-filled">Preenchido</FieldLabel>
            <Input id="demo-filled" defaultValue="Conta de energia" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-icon">Com ícone</FieldLabel>
            <Input id="demo-icon" icon="search" placeholder="Buscar transações" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-prefix">Com prefixo</FieldLabel>
            <Input id="demo-prefix" prefix="+55" placeholder="(00) 00000-0000" inputMode="tel" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-action">Com ação</FieldLabel>
            <Input
              id="demo-action"
              icon="search"
              defaultValue="Mercado"
              action={<IconButton icon="x" label="Limpar busca" size="sm" />}
            />
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="demo-invalid">Inválido</FieldLabel>
            <Input id="demo-invalid" aria-invalid defaultValue="nome@" />
            <FieldError>Informe um e-mail válido, como nome@empresa.com.br</FieldError>
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="demo-invalid-icon">Inválido com ícone</FieldLabel>
            <Input id="demo-invalid-icon" icon="mail" aria-invalid defaultValue="nome@" />
            <FieldError>Informe um e-mail válido, como nome@empresa.com.br</FieldError>
          </Field>
          <Field data-disabled="true">
            <FieldLabel htmlFor="demo-disabled">Desabilitado</FieldLabel>
            <Input id="demo-disabled" disabled defaultValue="Não editável" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-disabled-icon">Desabilitado com ícone</FieldLabel>
            <Input id="demo-disabled-icon" icon="calendar" disabled defaultValue="21/11/2026" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-readonly">Somente leitura</FieldLabel>
            <Input id="demo-readonly" readOnly defaultValue="TRX-2026-0142" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-readonly-icon">Somente leitura com ícone</FieldLabel>
            <Input id="demo-readonly-icon" icon="user" readOnly defaultValue="Luan Coelho" />
          </Field>
        </div>
      </Block>

      <Block title="Currency input">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="demo-currency">Valor</FieldLabel>
            <CurrencyInput id="demo-currency" value={amount} onChange={setAmount} />
            <FieldDescription>Valor digitado: {amount || 'vazio'}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-currency-empty">Vazio</FieldLabel>
            <CurrencyInput id="demo-currency-empty" value="" onChange={() => {}} />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-currency-invalid">Inválido</FieldLabel>
            <CurrencyInput id="demo-currency-invalid" value="" onChange={() => {}} aria-invalid />
            <FieldError>Informe o valor, como 120,00</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-currency-disabled">Desabilitado</FieldLabel>
            <CurrencyInput id="demo-currency-disabled" value="980,00" disabled />
          </Field>
        </div>
      </Block>

      <Block title="Input group">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <InputGroup>
            <InputGroupAddon>
              <Icon name="search" size={18} />
            </InputGroupAddon>
            <InputGroupInput placeholder="Buscar categoria" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>12 resultados</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput placeholder="https://exemplo.com.br" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="secondary">Verificar</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput aria-invalid defaultValue="valor inválido" />
          </InputGroup>
          <InputGroup>
            <InputGroupInput disabled defaultValue="Desabilitado" />
          </InputGroup>
        </div>
      </Block>

      <Block title="Textarea">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="demo-ta">Padrão</FieldLabel>
            <Textarea id="demo-ta" placeholder="Ex.: dividido com a família" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-ta-count">Com contador</FieldLabel>
            <Textarea id="demo-ta-count" maxLength={120} defaultValue="Compra do mês no mercado do bairro" />
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="demo-ta-invalid">Inválido</FieldLabel>
            <Textarea id="demo-ta-invalid" aria-invalid />
            <FieldError>Descreva a transação em pelo menos 3 caracteres</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-ta-disabled">Desabilitado</FieldLabel>
            <Textarea id="demo-ta-disabled" disabled defaultValue="Não editável" />
          </Field>
          <Field>
            <FieldLabel htmlFor="demo-ta-readonly">Somente leitura</FieldLabel>
            <Textarea id="demo-ta-readonly" readOnly defaultValue="Importado do extrato em 21/11/2026" />
          </Field>
        </div>
      </Block>

      <Block title="Field">
        <FieldSet className="max-w-xl">
          <FieldLegend>Dados da transação</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="demo-field-name">Descrição</FieldLabel>
              <FieldDescription>Aparece na lista de transações.</FieldDescription>
              <Input id="demo-field-name" placeholder="Ex.: Supermercado" />
            </Field>
            <Field>
              <FieldLabel htmlFor="demo-field-opt">
                Observações <span className="text-muted-foreground text-[13px] font-normal">(opcional)</span>
              </FieldLabel>
              <Input id="demo-field-opt" />
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="demo-field-check" defaultChecked />
              <FieldContent>
                <FieldLabel htmlFor="demo-field-check" className="text-[13px] font-normal">
                  Transação recorrente
                </FieldLabel>
                <FieldDescription>Repete todo mês na mesma data.</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
        <RadioGroup defaultValue="monthly" className="max-w-xl gap-2">
          <FieldLabel htmlFor="demo-card-monthly">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Mensal</FieldTitle>
                <FieldDescription>Copia o orçamento para o próximo mês.</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="monthly" id="demo-card-monthly" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="demo-card-yearly">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Anual</FieldTitle>
                <FieldDescription>Copia para os 12 meses seguintes.</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="yearly" id="demo-card-yearly" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </Block>

      <Block title="Form (react-hook-form)">
        <FormDemo />
      </Block>

      <Block title="Checkbox">
        <div className="flex flex-wrap items-center gap-6">
          {[
            { id: 'cb-off', label: 'Desmarcado', props: {} },
            { id: 'cb-on', label: 'Marcado', props: { defaultChecked: true } },
            { id: 'cb-mixed', label: 'Parcial', props: { checked: 'indeterminate' as const } },
            { id: 'cb-invalid', label: 'Inválido', props: { 'aria-invalid': true } },
            { id: 'cb-disabled', label: 'Desabilitado', props: { disabled: true } },
            { id: 'cb-disabled-on', label: 'Desabilitado marcado', props: { disabled: true, defaultChecked: true } },
          ].map(item => (
            <div key={item.id} className="flex items-center gap-2.5">
              <Checkbox id={item.id} {...item.props} />
              <Label htmlFor={item.id} className="text-[13px] font-normal">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Radio">
        <div className="flex flex-wrap gap-10">
          <RadioGroup defaultValue="saida" className="w-auto">
            {[
              { value: 'entrada', label: 'Entrada' },
              { value: 'saida', label: 'Saída' },
              { value: 'reserva', label: 'Reserva' },
            ].map(item => (
              <div key={item.value} className="flex items-center gap-2.5">
                <RadioGroupItem value={item.value} id={`rd-${item.value}`} />
                <Label htmlFor={`rd-${item.value}`} className="text-[13px] font-normal">
                  {item.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <RadioGroup defaultValue="a" className="w-auto">
            <div className="flex items-center gap-2.5">
              <RadioGroupItem value="a" id="rd-invalid" aria-invalid />
              <Label htmlFor="rd-invalid" className="text-error-text text-[13px] font-normal">
                Inválido
              </Label>
            </div>
          </RadioGroup>
          <RadioGroup defaultValue="on" disabled className="w-auto">
            <div className="flex items-center gap-2.5">
              <RadioGroupItem value="off" id="rd-disabled" />
              <Label htmlFor="rd-disabled" className="text-[13px] font-normal">
                Desabilitado
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <RadioGroupItem value="on" id="rd-disabled-on" />
              <Label htmlFor="rd-disabled-on" className="text-[13px] font-normal">
                Desabilitado selecionado
              </Label>
            </div>
          </RadioGroup>
        </div>
      </Block>

      <Block title="Switch">
        <div className="flex flex-wrap items-center gap-6">
          {[
            { id: 'sw-off', label: 'Notificações por e-mail', props: {} },
            { id: 'sw-on', label: 'Lembrete de contas', props: { defaultChecked: true } },
            { id: 'sw-disabled', label: 'Desabilitado', props: { disabled: true } },
            { id: 'sw-disabled-on', label: 'Desabilitado ligado', props: { disabled: true, defaultChecked: true } },
          ].map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <Switch id={item.id} {...item.props} />
              <Label htmlFor={item.id} className="text-[13px] font-normal">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Toggle button">
        <div className="flex flex-wrap items-center gap-3">
          <Toggle icon="filter" pressed={pressed} onPressedChange={setPressed} count={pressed ? 3 : undefined}>
            Filtros
          </Toggle>
          <Toggle>Só pendentes</Toggle>
          <Toggle defaultPressed icon="eye">
            Mostrar arquivadas
          </Toggle>
          <Toggle disabled>Desabilitado</Toggle>
          <Toggle disabled defaultPressed>
            Desabilitado ligado
          </Toggle>
        </div>
      </Block>

      <Block title="Segmented (toggle group)">
        <div className="flex flex-col gap-4">
          <ToggleGroup type="single" value={segment} onValueChange={setSegment} aria-label="Período">
            <ToggleGroupItem value="day">Hoje</ToggleGroupItem>
            <ToggleGroupItem value="week">Semana</ToggleGroupItem>
            <ToggleGroupItem value="month">Mês</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" defaultValue="list" aria-label="Visualização">
            <ToggleGroupItem value="list" icon="list">
              Lista
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" icon="grid">
              Grade
            </ToggleGroupItem>
            <ToggleGroupItem value="chart" icon="chart-bar" disabled>
              Gráfico
            </ToggleGroupItem>
          </ToggleGroup>
          <div className="max-w-md">
            <ToggleGroup type="single" defaultValue="all" fullWidth aria-label="Escopo">
              <ToggleGroupItem value="all">Todas</ToggleGroupItem>
              <ToggleGroupItem value="mine">Minhas</ToggleGroupItem>
              <ToggleGroupItem value="shared">Compartilhadas</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Block>

      <Block title="Selection button">
        <div role="group" aria-label="Categoria" className="flex max-w-2xl flex-wrap gap-2">
          {categories.map(item => (
            <SelectionButton key={item} selected={category === item} onClick={() => setCategory(item)}>
              <span>{item}</span>
            </SelectionButton>
          ))}
          <SelectionButton selected={false} icon="grid" disabled>
            <span>Desabilitado</span>
          </SelectionButton>
        </div>
      </Block>

      <Block title="Chip">
        <div className="flex flex-wrap items-center gap-2">
          {['Todas', 'Recorrentes', 'Sem categoria'].map(item => (
            <Chip key={item} selected={selectedChip === item} onClick={() => setSelectedChip(item)}>
              {item}
            </Chip>
          ))}
          <Chip icon="calendar">Novembro</Chip>
          <Chip disabled>Desabilitado</Chip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {chips.map(item => (
            <Chip key={item} size="sm" onRemove={() => setChips(current => current.filter(chip => chip !== item))}>
              {item}
            </Chip>
          ))}
          {chips.length === 0 ? (
            <Button size="sm" variant="ghost" onClick={() => setChips(['Mercado', 'Farmácia', 'Combustível'])}>
              Restaurar
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="lg" iconRight="chevron-down">
            Categoria
          </Chip>
          <Chip size="lg" selected iconRight="chevron-down" onRemove={() => {}} removeLabel="Remover filtro de usuário">
            Usuário: Luan
          </Chip>
          <Chip selected onRemove={() => {}}>
            Selecionado removível
          </Chip>
          <Chip disabled onRemove={() => {}}>
            Desabilitado removível
          </Chip>
        </div>
      </Block>
    </div>
  )
}
