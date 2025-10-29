// chatlog.ts
import { openDB, addDataWithFK, DB_NAME } from './base.ts'
import type {
    Chatlog,
    CreateChatLogDto,
    UpdateChatLogDto,
} from '../../types/Chatlog.types.ts'
import { getStore, handleRequest } from '@store/dbHelpers.ts'
// Creates a new chat log entry with foreign key validation (persona_id)
export const createChatLog = async (data: CreateChatLogDto): Promise<number> =>
    await addDataWithFK(
        'Chatlog',
        {
            persona_id: data.persona_id,
            created_at: new Date().toISOString(),
            updated_at: null,
            conversation_id: data.conversation_id,
            content: data.content,
            prompt: data.prompt,
            role: data.role,
            model: data.model,
        },
        { store: 'Persona', key: 'persona_id' }
    )

// Retrieves a single chat log entry by its ID
export const getChatLogById = async (id: number): Promise<Chatlog | null> => {
    const store = await getStore('Chatlog')
    return handleRequest(store.get(id))
}

// Retrieves all chat logs associated with a specific conversation ID
export const getChatLogsByConversationId = async (
    conversation_id: string
): Promise<Chatlog[] | null> => {
    const store = await getStore('Chatlog')
    const index = store.index('conversation_id')
    return handleRequest(index.getAll(conversation_id))
}

// Retrieves chat logs grouped by creation date and conversation ID for a specific persona
export async function getChatLogsByPersonaId(personaId: number) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME)

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            const transaction = db.transaction(['Chatlog'], 'readonly')
            const store = transaction.objectStore('Chatlog')
            const index = store.index('persona_id')

            const chatLogsCreatedAt: Record<string, Record<string, any[]>> = {}

            const cursorRequest = index.openCursor(IDBKeyRange.only(personaId))

            cursorRequest.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
                    .result

                if (cursor) {
                    const log = cursor.value

                    const created_at = log.created_at.split('T')[0]
                    const conversation_id = log.conversation_id

                    // Check if conversation already exists under a different (older) date
                    let existingDate: string | undefined

                    for (const date in chatLogsCreatedAt) {
                        if (chatLogsCreatedAt[date][conversation_id]) {
                            existingDate = date
                            break
                        }
                    }

                    // If it's already there and the current date is newer, move it
                    if (existingDate && created_at > existingDate) {
                        // Move data to the newer date
                        const logsToMove =
                            chatLogsCreatedAt[existingDate][conversation_id]

                        // Create new date entry if needed
                        if (!chatLogsCreatedAt[created_at]) {
                            chatLogsCreatedAt[created_at] = {}
                        }
                        chatLogsCreatedAt[created_at][conversation_id] =
                            logsToMove

                        // Delete from old date
                        delete chatLogsCreatedAt[existingDate][conversation_id]

                        // Clean up empty date bucket if needed
                        if (
                            Object.keys(chatLogsCreatedAt[existingDate])
                                .length === 0
                        ) {
                            delete chatLogsCreatedAt[existingDate]
                        }
                    }

                    // Now push the new log under the (correct) latest date
                    if (!chatLogsCreatedAt[created_at]) {
                        chatLogsCreatedAt[created_at] = {}
                    }
                    if (!chatLogsCreatedAt[created_at][conversation_id]) {
                        chatLogsCreatedAt[created_at][conversation_id] = []
                    }

                    chatLogsCreatedAt[created_at][conversation_id].push(log)

                    cursor.continue()
                } else {
                    // Sort logs by timestamp within each conversation
                    Object.keys(chatLogsCreatedAt).forEach((created_at) => {
                        Object.keys(chatLogsCreatedAt[created_at]).forEach(
                            (conversation_id) => {
                                chatLogsCreatedAt[created_at][
                                    conversation_id
                                ].sort((a, b) => a.timestamp - b.timestamp)
                            }
                        )
                    })

                    resolve(chatLogsCreatedAt)
                }
            }

            cursorRequest.onerror = () => reject('Failed to fetch chat logs')
        }

        request.onerror = () => reject('Failed to open database')
    })
}

// Retrieves the latest message from each conversation
export async function getLastMessages() {
    const store = await getStore('Chatlog')
    const allLogs: any[] = await handleRequest(store.getAll())

    const conversations: Record<string, any> = {}

    allLogs.forEach((log) => {
        if (
            !conversations[log.conversation_id] ||
            new Date(log.timestamp) >
                new Date(conversations[log.conversation_id].timestamp)
        ) {
            conversations[log.conversation_id] = log
        }
    })

    return Object.values(conversations).map((log) => ({
        conversation_id: log.conversation_id,
        lastMessage: log.content,
        timestamp: log.timestamp,
        date: log.timestamp.split('T')[0],
        time: log.timestamp.split('T')[1].split('.')[0],
    }))
}

// Updates an existing chat log entry by ID
export const updateChatLog = async (
    id: number,
    data: UpdateChatLogDto
): Promise<boolean> => {
    const store = await getStore('Chatlog', 'readwrite')
    const existingLog = await handleRequest(store.get(id))

    if (!existingLog) {
        throw new Error(`ChatLog with id ${id} not found.`)
    }

    const updated = {
        ...existingLog,
        ...data,
        updated_at: new Date().toISOString(),
    }

    await handleRequest(store.put(updated))
    return true
}

// Deletes a chat log entry by ID
export const deleteChatLog = async (id: number): Promise<boolean> => {
    const store = await getStore('Chatlog', 'readwrite')
    await handleRequest(store.delete(id))
    return true
}

// Retrieves all chat log entries
export const listChatLogs = async (): Promise<Chatlog[]> => {
    const store = await getStore('Chatlog')
    return handleRequest(store.getAll())
}

// Deletes multiple chat log entries by their IDs
export const bulkDeleteChatLogs = async (ids: number[]): Promise<boolean> => {
    const store = await getStore('Chatlog', 'readwrite')
    await Promise.all(ids.map((id) => handleRequest(store.delete(id))))
    return true
}
