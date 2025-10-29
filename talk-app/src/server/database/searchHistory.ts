import type { SearchHistory } from '../../types/SearchHistory.types.ts'
import { addDataWithFK } from './base.ts'
import { getStore, handleRequest } from '@store/dbHelpers.ts'

// Creates a new search history entry or updates the timestamp if the query already exists
export const createSearchHistory = async (
    search_query: string
): Promise<number | undefined> => {
    const store = await getStore('SearchHistory', 'readwrite')
    const index = store.index('search_query')

    // Check if the search query already exists
    const existingHistory = await handleRequest(index.get(search_query))

    if (!existingHistory) {
        // Add new search query if it doesn't exist
        return addDataWithFK('SearchHistory', {
            created_at: new Date().toISOString(),
            search_query,
        })
    } else {
        // Update timestamp if the search query already exists
        existingHistory.updated_at = new Date().toISOString()
        const updateRequest = store.put(existingHistory)

        return new Promise((resolve, reject) => {
            updateRequest.onsuccess = () => resolve(existingHistory.id)
            updateRequest.onerror = () => reject(updateRequest.error)
        })
    }
    return undefined
}

// Retrieves all search history entries, sorted by most recently updated or created
export const listSearchHistories = async (): Promise<SearchHistory[]> => {
    const store = await getStore('SearchHistory')
    const histories = await handleRequest(store.getAll())

    return (histories || []).sort((a: SearchHistory, b: SearchHistory) => {
        return (
            new Date(b.updated_at ?? b.created_at).getTime() -
            new Date(a.updated_at ?? a.created_at).getTime()
        )
    })
}
