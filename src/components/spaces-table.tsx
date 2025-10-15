'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit, MoreHorizontal, Trash2, UserCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Space } from '@/app/db/schemas/space-schema'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useDeleteSpace, useSpaces } from '@/hooks/use-spaces'

import { routes } from '@/lib/routes'

export function SpacesTable() {
  const { data: spaces, isLoading, error } = useSpaces()
  const deleteSpaceMutation = useDeleteSpace()
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null)

  if (isLoading) {
    return <div className="py-4 text-center">Carregando espaços...</div>
  }

  if (error) {
    return <div className="text-destructive py-4 text-center">Erro ao carregar espaços</div>
  }

  if (!spaces || spaces.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground mb-4">Nenhum espaço encontrado</p>
        <Button asChild>
          <Link href={routes.frontend.admin.spaces.create}>Criar Primeiro Espaço</Link>
        </Button>
      </div>
    )
  }

  async function handleDelete() {
    if (spaceToDelete) {
      await deleteSpaceMutation.mutateAsync(spaceToDelete.id)
      setSpaceToDelete(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="w-[70px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spaces.map(space => (
            <TableRow key={space.id}>
              <TableCell className="font-medium">{space.name}</TableCell>
              <TableCell className="text-muted-foreground">{space.description || 'Sem descrição'}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(space.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={routes.frontend.admin.spaces.members(space.id)}>
                        <Users className="mr-2 h-4 w-4" />
                        Membros
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={routes.frontend.admin.spaces.edit(space.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => setSpaceToDelete(space)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!spaceToDelete} onOpenChange={() => setSpaceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o espaço &quot;{spaceToDelete?.name}&quot;? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteSpaceMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteSpaceMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
