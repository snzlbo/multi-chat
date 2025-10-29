import { openDB, addDataWithFK } from './base.ts'
import type {
    PersonaTypes,
    CreatePersonaDto,
    UpdatePersonaDto,
    PersonaGroupTypes,
} from '../../types/Persona.types.ts'
import { listGroups, updateGroup } from './group.ts'
import { getStore, handleRequest } from '@store/dbHelpers.ts'
import { getExpertMode } from './expert.ts'

// Creates a new persona entry, optionally associating it with a group and using default prompts if not provided
export const createPersona = async (
    data: CreatePersonaDto
): Promise<number> => {
    const prompts = await getExpertMode()
    const personaData = {
        created_at: new Date().toISOString(),
        name: data.name,
        profile_description: data.profile_description || '',
        other_description: data.other_description || '',
        original_file: data.original_file,
        thumb_file: data.thumb_file,
        status: data.status || 1,
        extraction_prompt:
            data.extraction_prompt || prompts?.gemini_extract_text_prompt,
        format_extraction_prompt:
            data.format_extraction_prompt || prompts?.format_extraction_prompt,
        chat_prompt: data.chat_prompt || prompts?.chat_prompt,
        img_gen_prompt: data.img_gen_prompt || prompts?.img_gen_prompt,
        img_gen_model: data.img_gen_model || 'dall-e-3',
        group_id: data.group_id,
    }
    let id: number | null = null

    // Adds persona with foreign key validation if group_id is provided
    if (personaData.group_id) {
        id = await addDataWithFK('Persona', personaData, {
            store: 'Group',
            key: 'group_id',
        })
        await updateGroup(personaData.group_id)
    } else {
        await addDataWithFK('Persona', personaData)
    }

    return Number(id)
}

// Retrieves a persona by its ID
export const getPersonaById = async (
    id: number
): Promise<PersonaTypes | null> => {
    const store = await getStore('Persona')
    const persona = handleRequest(store.get(id))
        .then((resp) => {
            return resp || null
        })
        .catch((err) => {
            throw new Error('Error fetching persona: ' + err)
        })
    return persona
}

// Updates an existing persona entry by its ID
export const updatePersona = async (
    id: number,
    data: UpdatePersonaDto
): Promise<boolean> => {
    const store = await getStore('Persona', 'readwrite')
    const existingPersona = await handleRequest(store.get(id))

    if (!existingPersona) {
        throw new Error('Persona not found')
    }

    const updatedPersona = {
        ...existingPersona,
        ...data,
        updated_at: new Date().toISOString(),
    }

    await handleRequest(store.put(updatedPersona))

    return true
}

// Deletes a persona entry by its ID
export const deletePersona = async (id: number): Promise<boolean> => {
    const store = await getStore('Persona', 'readwrite')
    await handleRequest(store.delete(id))
    return true
}

// Duplicates an existing persona, creating a new entry with "(Copy)" appended to its name
export const duplicatePersona = async (id: number): Promise<number> => {
    const store = await getStore('Persona', 'readwrite')
    const existingPersona = await handleRequest(store.get(id))

    if (!existingPersona) {
        throw new Error('Persona not found')
    }

    const duplicatedPersona = {
        ...existingPersona,
        name: `${existingPersona.name} (Copy)`,
        created_at: new Date().toISOString(),
    }

    delete duplicatedPersona.id
    const newId = await handleRequest(store.add(duplicatedPersona))
    return newId as number
}

// Lists all personas sorted by creation or update date, in ascending or descending order
export const listPersonas = async (
    direction: 'ASC' | 'DESC' = 'DESC'
): Promise<PersonaTypes[]> => {
    const store = await getStore('Persona')
    const allPersonas: PersonaTypes[] =
        (await handleRequest(store.getAll())) || []

    return allPersonas.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime()
        const dateB = new Date(b.updated_at || b.created_at).getTime()
        return direction === 'ASC' ? dateA - dateB : dateB - dateA
    })
}

// Lists personas grouped by their associated group, optionally filtering by a specific group ID
export const listPersonasByGroup = async (
    groupId?: number,
    direction: 'ASC' | 'DESC' = 'DESC'
): Promise<PersonaGroupTypes[]> => {
    const allPersonas = await listPersonas(direction)
    const groups = await listGroups()

    const grouped: PersonaGroupTypes[] = []
    const groupMap = groups.reduce(
        (map, group) => {
            map[group.id] = {
                id: group.id,
                name: group.name,
                created_at: group.created_at,
                updated_at: group.updated_at,
                personaList: [],
            }
            return map
        },
        {} as { [key: string]: PersonaGroupTypes }
    )

    allPersonas.forEach((persona) => {
        const groupKey = persona.group_id ? persona.group_id : 'ungrouped'
        if (groupId && groupKey !== groupId) return

        if (!groupMap[groupKey]) {
            groupMap[groupKey] = {
                id: groupKey,
                name: groupKey === 'ungrouped' ? '未設定' : '',
                personaList: [],
                created_at: '',
                updated_at: '',
            }
        }

        groupMap[groupKey].personaList.push(persona)
    })

    const sortedGroups = Object.values(groupMap).sort((a, b) => {
        const dateA = a.updated_at || a.created_at
        const dateB = b.updated_at || b.created_at
        return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    sortedGroups.forEach((groupedItem) => {
        if (groupId) {
            if (groupedItem.id === groupId) {
                grouped.push(groupedItem)
            }
        } else {
            grouped.push(groupedItem)
        }
    })

    return grouped
}

// Deletes multiple personas by their IDs
export const bulkDeletePersonas = async (ids: number[]): Promise<boolean> => {
    const store = await getStore('Persona', 'readwrite')
    await Promise.all(ids.map((id) => handleRequest(store.delete(id))))
    return true
}
