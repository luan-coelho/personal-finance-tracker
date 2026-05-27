#!/usr/bin/env tsx

import 'dotenv/config'

import { eq } from 'drizzle-orm'

import { db } from '@/app/db'
import {
  organizationLabelsTable,
  organizationProjectSectionsTable,
  organizationProjectsTable,
  spacesTable,
} from '@/app/db/schemas'

const defaultProjects = ['Casa', 'Compras', 'Trabalho', 'Estudos', 'Projetos', 'Igreja'] as const
const defaultSections = ['A fazer', 'Aguardando', 'Concluido'] as const
const defaultLabels = ['urgente', 'mercado', 'ligacao', 'online'] as const

const normalizeName = (name: string) => name.toLocaleLowerCase('pt-BR')

type SeedCounts = {
  projectsCreated: number
  projectsSkipped: number
  sectionsCreated: number
  sectionsSkipped: number
  labelsCreated: number
  labelsSkipped: number
}

async function findProject(spaceId: string, name: string) {
  const projects = await db
    .select()
    .from(organizationProjectsTable)
    .where(eq(organizationProjectsTable.spaceId, spaceId))

  return projects.find(project => normalizeName(project.name) === normalizeName(name))
}

async function ensureProject(spaceId: string, ownerId: string, name: string, counts: SeedCounts) {
  const existingProject = await findProject(spaceId, name)

  if (existingProject) {
    counts.projectsSkipped++
    return existingProject
  }

  const [createdProject] = await db
    .insert(organizationProjectsTable)
    .values({
      spaceId,
      name,
      visibility: 'shared',
      createdById: ownerId,
    })
    .returning()

  counts.projectsCreated++
  return createdProject
}

async function ensureSection(projectId: string, name: string, position: number, counts: SeedCounts) {
  const sections = await db
    .select({
      id: organizationProjectSectionsTable.id,
      name: organizationProjectSectionsTable.name,
    })
    .from(organizationProjectSectionsTable)
    .where(eq(organizationProjectSectionsTable.projectId, projectId))

  if (sections.some(section => normalizeName(section.name) === normalizeName(name))) {
    counts.sectionsSkipped++
    return
  }

  await db.insert(organizationProjectSectionsTable).values({
    projectId,
    name,
    position,
  })

  counts.sectionsCreated++
}

async function ensureLabel(spaceId: string, name: string, counts: SeedCounts) {
  const labels = await db
    .select({
      id: organizationLabelsTable.id,
      name: organizationLabelsTable.name,
    })
    .from(organizationLabelsTable)
    .where(eq(organizationLabelsTable.spaceId, spaceId))

  if (labels.some(label => normalizeName(label.name) === normalizeName(name))) {
    counts.labelsSkipped++
    return
  }

  await db.insert(organizationLabelsTable).values({
    spaceId,
    name,
  })

  counts.labelsCreated++
}

async function seedOrganizationDefaults() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Configure database env before running this seed.')
  }

  const counts: SeedCounts = {
    projectsCreated: 0,
    projectsSkipped: 0,
    sectionsCreated: 0,
    sectionsSkipped: 0,
    labelsCreated: 0,
    labelsSkipped: 0,
  }

  const spaces = await db.select().from(spacesTable)

  if (spaces.length === 0) {
    console.log('No spaces found. Nothing to seed.')
    return
  }

  for (const space of spaces) {
    console.log(`Seeding organization defaults for space: ${space.name} (${space.id})`)

    for (const projectName of defaultProjects) {
      const project = await ensureProject(space.id, space.ownerId, projectName, counts)

      for (const [sectionIndex, sectionName] of defaultSections.entries()) {
        await ensureSection(project.id, sectionName, sectionIndex, counts)
      }
    }

    for (const labelName of defaultLabels) {
      await ensureLabel(space.id, labelName, counts)
    }
  }

  console.log('Organization defaults seed finished.')
  console.log(`Spaces processed: ${spaces.length}`)
  console.log(`Projects created: ${counts.projectsCreated}`)
  console.log(`Projects skipped: ${counts.projectsSkipped}`)
  console.log(`Sections created: ${counts.sectionsCreated}`)
  console.log(`Sections skipped: ${counts.sectionsSkipped}`)
  console.log(`Labels created: ${counts.labelsCreated}`)
  console.log(`Labels skipped: ${counts.labelsSkipped}`)
}

seedOrganizationDefaults()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error('Failed to seed organization defaults:')
    console.error(error)
    process.exit(1)
  })
