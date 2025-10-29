import type { BaseEntity } from './main'

export interface Chatlog extends BaseEntity {
    conversation_id: string
    persona_id: number
    content: string
    prompt: string
    role: string
    model: string
}

export interface SessionChatlog {
    [key: string]: Chatlog[]
}

export interface ChatlogCreatedAt {
    [key: string]: SessionChatlog
}

export interface CreateChatLogDto {
    persona_id: number
    conversation_id: string
    content: string
    prompt: string
    role: string
    model: string
}

export interface UpdateChatLogDto {
    content?: string
    prompt?: string
    role?: string
    model?: string
    updated_at?: string
}
