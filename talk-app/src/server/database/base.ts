import { DummyPersonaData } from '@data/persona.data.ts'
import {
    PERSONA_CHAT_PROMPT,
    GEMINI_EXTRACT_TEXT_PROMPT,
    DALLE_PROMPT,
} from '../../static/prompt.ts'
import { ENV } from 'astro:env/client'
import { createDefaultPersonas } from './logic.ts'
import { handleRequest } from '@store/dbHelpers.ts'

// Database name and version configuration
export const DB_NAME = `TalkAppDB-${ENV}`
const DB_VERSION = 1

// Opens IndexedDB and initializes object stores if needed
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        // Handles database schema creation and upgrades
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result

            // PERSONA TABLE: Stores persona-related data
            if (!db.objectStoreNames.contains('Persona')) {
                const store = db.createObjectStore('Persona', {
                    keyPath: 'id',
                    autoIncrement: true,
                })
                store.createIndex('created_at', 'created_at', { unique: false })
                store.createIndex('name', 'name', { unique: false })
                store.createIndex('other_description', 'other_description', {
                    unique: false,
                })
                store.createIndex(
                    'profile_description',
                    'profile_description',
                    {
                        unique: false,
                    }
                )
                store.createIndex('original_file', 'original_file', {
                    unique: false,
                })
                store.createIndex('thumb_file', 'thumb_file', { unique: false })
                store.createIndex('extraction_prompt', 'extraction_prompt', {
                    unique: false,
                })
                store.createIndex('chat_prompt', 'chat_prompt', {
                    unique: false,
                })
                store.createIndex('status', 'status', { unique: false })
                store.createIndex('img_gen_prompt', 'img_gen_prompt', {
                    unique: false,
                })
                store.createIndex('img_gen_model', 'img_gen_model', {
                    unique: false,
                })
                store.createIndex('group_id', 'group_id', { unique: false })
            }

            // GROUP TABLE: Stores group-related data
            if (!db.objectStoreNames.contains('Group')) {
                const store = db.createObjectStore('Group', {
                    keyPath: 'id',
                    autoIncrement: true,
                })
                store.createIndex('name', 'name', { unique: true })
                store.createIndex('created_at', 'created_at', { unique: false })
                store.createIndex('updated_at', 'updated_at', { unique: false })
            }

            // CHATLOG TABLE: Stores chat conversation logs
            if (!db.objectStoreNames.contains('Chatlog')) {
                const store = db.createObjectStore('Chatlog', {
                    keyPath: 'id',
                    autoIncrement: true,
                })
                store.createIndex('created_at', 'created_at', { unique: false })
                store.createIndex('updated_at', 'updated_at', { unique: false })
                store.createIndex('conversation_id', 'conversation_id', {
                    unique: false,
                })
                store.createIndex('persona_id', 'persona_id', { unique: false })
                store.createIndex('content', 'content', { unique: false })
                store.createIndex('prompt', 'prompt', { unique: false })
                store.createIndex('role', 'role', { unique: false })
                store.createIndex('model', 'model', { unique: false })
            }

            // SEARCH HISTORY TABLE: Stores user search queries
            if (!db.objectStoreNames.contains('SearchHistory')) {
                const store = db.createObjectStore('SearchHistory', {
                    keyPath: 'id',
                    autoIncrement: true,
                })
                store.createIndex('search_query', 'search_query', {
                    unique: false,
                })
                store.createIndex('group_id', 'group_id', { unique: false })
            }

            // EXPERT MODE TABLE: Stores expert mode configurations
            if (!db.objectStoreNames.contains('ExpertMode')) {
                const store = db.createObjectStore('ExpertMode', {
                    keyPath: 'id',
                    autoIncrement: true,
                })
                store.createIndex('created_at', 'created_at', { unique: false })
                store.createIndex('updated_at', 'updated_at', { unique: false })
                store.createIndex('is_enabled', 'is_enabled', {
                    unique: false,
                })
                store.createIndex('chat_prompt', 'chat_prompt', {
                    unique: false,
                })
                store.createIndex('chat_model', 'chat_model', {
                    unique: false,
                })
                store.createIndex('img_gen_prompt', 'img_gen_prompt', {
                    unique: false,
                })
                store.createIndex('img_gen_model', 'img_gen_model', {
                    unique: false,
                })
                store.createIndex(
                    'gemini_extract_text_prompt',
                    'gemini_extract_text_prompt',
                    { unique: false }
                )

                // Initialize default data after creating ExpertMode table
                store.transaction.oncomplete = async () => {
                    await createDefaultPersonas()
                    const ExpertModeStore = db
                        .transaction('ExpertMode', 'readwrite')
                        .objectStore('ExpertMode')
                    ExpertModeStore.add({
                        created_at: new Date().toISOString(),
                        is_enabled: false,
                        chat_prompt: PERSONA_CHAT_PROMPT,
                        chat_model: 'gpt-4o',
                        img_gen_prompt: DALLE_PROMPT,
                        img_gen_model: 'dall-e-3',
                        gemini_extract_text_prompt: GEMINI_EXTRACT_TEXT_PROMPT,
                    })
                }
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// Adds data to a store with optional foreign key constraint checking
const addDataWithFK = async (
    storeName: string,
    data: any,
    foreignKey?: { store: string; key: string }
): Promise<number> => {
    const db = await openDB()

    return new Promise((resolve, reject) => {
        const tx = db.transaction(
            [storeName, foreignKey?.store || ''].filter(Boolean),
            'readwrite'
        )

        if (foreignKey) {
            const fkStore = tx.objectStore(foreignKey.store)
            const fkRequest = fkStore.get(data[foreignKey.key])

            fkRequest.onsuccess = () => {
                if (!fkRequest.result) {
                    reject(
                        `Foreign key constraint failed: ${foreignKey.store}.${foreignKey.key} does not exist.`
                    )
                    return
                }
                const store = tx.objectStore(storeName)
                const request = store.add(data)
                request.onsuccess = () => resolve(request.result as number)
                request.onerror = () => reject(request.error)
            }

            fkRequest.onerror = () => reject(fkRequest.error)
        } else {
            const store = tx.objectStore(storeName)
            const request = store.add(data)
            request.onsuccess = () => resolve(request.result as number)
            request.onerror = () => reject(request.error)
        }
    })
}

// Clears specified tables and reinitializes default data
export const clearTable = async () => {
    const db = await openDB()
    const transaction = db.transaction(
        ['Persona', 'Group', 'Chatlog', 'ExpertMode'],
        'readwrite'
    )
    const personasStore = transaction.objectStore('Persona')
    const groupsStore = transaction.objectStore('Group')
    const chatlogStore = transaction.objectStore('Chatlog')
    const promptStore = transaction.objectStore('ExpertMode')

    await Promise.all([
        handleRequest(personasStore.clear()),
        handleRequest(groupsStore.clear()),
        handleRequest(chatlogStore.clear()),
        handleRequest(promptStore.clear()),
    ])

    transaction.oncomplete = async () => {
        await createDefaultPersonas()
        const newTransaction = db.transaction('ExpertMode', 'readwrite')
        const newPromptStore = newTransaction.objectStore('ExpertMode')
        newPromptStore.add({
            created_at: new Date().toISOString(),
            chat_prompt: PERSONA_CHAT_PROMPT,
            gemini_extract_text_prompt: GEMINI_EXTRACT_TEXT_PROMPT,
            img_gen_prompt: DALLE_PROMPT,
        })
        newTransaction.oncomplete = () => db.close()
    }
}

export { openDB, addDataWithFK }
