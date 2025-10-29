import { openDB } from 'src/server/database/base'

// Retrieves an object store with specified transaction mode
export const getStore = async (
    storeName: string,
    mode: IDBTransactionMode = 'readonly'
) => {
    const db = await openDB()
    const tx = db.transaction(storeName, mode)
    return tx.objectStore(storeName)
}

// Handles IndexedDB requests and returns a promise
export const handleRequest = <T>(request: IDBRequest<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}
