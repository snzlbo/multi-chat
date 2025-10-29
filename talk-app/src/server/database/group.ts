import type { Group } from '../../types/Group.types.ts'
import { addDataWithFK, openDB } from './base.ts'
import { getStore, handleRequest } from '@store/dbHelpers.ts'

// Creates a new group with the provided name and current timestamp
export const createGroup = async (name: string): Promise<number> => {
    return await addDataWithFK('Group', {
        created_at: new Date().toISOString(),
        name,
    })
}

// Updates an existing group's name by its ID, ensuring uniqueness of the group name
export const updateGroup = async (id: number, name?: string): Promise<void> => {
    const store = await getStore('Group', 'readwrite')
    const group = await handleRequest(store.get(id))

    if (!group) throw new Error('Group not found')

    // Check if the new name already exists in another group
    if (name) {
        const index = store.index('name')
        const existingGroup = await handleRequest(index.get(name))
        if (existingGroup && existingGroup.id !== id) {
            throw new Error('Another group with this name already exists')
        }
        group.name = name
    }

    // Update the timestamp to reflect the modification
    group.updated_at = new Date().toISOString()
    await handleRequest(store.put(group))
}

// Deletes a group by its ID
export const deleteGroup = async (id: number): Promise<boolean> => {
    const store = await getStore('Group', 'readwrite')
    await handleRequest(store.delete(id))
    return true
}

// Retrieves and returns all groups, sorted by most recently updated or created
export const listGroups = async (): Promise<Group[]> => {
    const store = await getStore('Group')
    const groups = await handleRequest(store.getAll())

    return (groups || []).sort(
        (a, b) =>
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || b.created_at).getTime()
    )
}
