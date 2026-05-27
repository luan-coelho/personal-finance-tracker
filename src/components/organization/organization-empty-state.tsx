import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface OrganizationEmptyStateProps {
  title: string
  description: string
}

export function OrganizationEmptyState({ title, description }: OrganizationEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="max-w-md">{description}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
