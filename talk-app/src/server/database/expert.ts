import { addDataWithFK, openDB } from './base.ts'
import type {
    ExpertMode,
    UpdateExpertModeDto,
} from '../../types/Expert.types.ts'
import { getStore, handleRequest } from '@store/dbHelpers.ts'

// Creates a new ExpertMode entry with provided chat and extraction prompts
const createExpertMode = async ({
    chat_prompt,
    format_extraction_prompt,
}: {
    chat_prompt: string
    format_extraction_prompt: string
}) => {
    try {
        const promptData = {
            chat_prompt,
            format_extraction_prompt,
            created_at: new Date().toISOString(),
        }

        const promptId = await addDataWithFK('ExpertMode', promptData)
        return promptId
    } catch (error) {
        console.error('Error adding prompt template:', error)
    }
}

// Retrieves the first available ExpertMode configuration from the database
const getExpertMode = async (): Promise<ExpertMode | null> => {
    try {
        const store = await getStore('ExpertMode')
        const results = await handleRequest(store.getAll())
        return results[0] || null
    } catch (error) {
        console.error('Error in getExpertMode:', error)
        return null
    }
}

// Updates an existing ExpertMode entry identified by its ID
const updateExpertMode = async (
    data: UpdateExpertModeDto
): Promise<boolean> => {
    try {
        const store = await getStore('ExpertMode', 'readwrite')
        const existingData = await handleRequest(store.get(data.id))

        if (!existingData) {
            throw new Error('Template not found')
        }

        const updatedData = {
            ...existingData,
            ...data,
            created_at: existingData.created_at,
        }

        await handleRequest(store.put(updatedData))
        return true
    } catch (error) {
        console.error('Error in updateExpertMode:', error)
        return false
    }
}

// Deletes an ExpertMode entry by its ID
const deleteExpertMode = async (id: number): Promise<boolean> => {
    try {
        const store = await getStore('ExpertMode', 'readwrite')
        await handleRequest(store.delete(id))
        return true
    } catch (error) {
        console.error('Error in deleteExpertMode:', error)
        return false
    }
}

export { createExpertMode, getExpertMode, updateExpertMode, deleteExpertMode }
