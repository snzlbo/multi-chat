export type MessageType = {
    id: string
    sender: 'self' | 'other'
    content: string
    dummyContentId?: string //'generating' | 'sample1' | 'sample2' | 'sample3'
    generating?: boolean
}

export type ContentType = {
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
        url: string
    }
}

export type MessageLog = {
    conversationId: string
    role: 'user' | 'assistant'
    content: ContentType[]
    generating?: boolean
}
