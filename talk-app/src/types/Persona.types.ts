import type { BaseEntity } from './main'

export type PersonaStatus = 'uploading' | 'done' | 'failed'
export type ImageGenerationModelTypes =
    | 'dall-e-3'
    | 'imagen-3.0-generate-002'
    | 'gpt-image-1'

export interface PersonaTypes extends BaseEntity {
    name: string
    other_description: string
    profile_description?: string
    original_file?: Blob
    thumb_file?: Blob
    status?: PersonaStatus

    extraction_prompt?: string
    format_extraction_prompt?: string
    chat_prompt?: string
    img_gen_prompt?: string
    img_gen_model?: ImageGenerationModelTypes

    group_id: number | null
}

export interface CreatePersonaDto {
    name: string
    other_description: string
    profile_description?: string
    original_file?: Blob
    thumb_file?: Blob
    status?: PersonaStatus

    extraction_prompt?: string
    format_extraction_prompt?: string
    chat_prompt?: string
    img_gen_prompt?: string
    img_gen_model?: ImageGenerationModelTypes

    group_id: number | null
}

export interface UpdatePersonaDto {
    name?: string
    other_description?: string
    profile_description?: string
    original_file?: Blob
    thumb_file?: Blob
    status?: PersonaStatus

    extraction_prompt?: string
    format_extraction_prompt?: string
    chat_prompt?: string
    img_gen_prompt?: string
    img_gen_model?: ImageGenerationModelTypes

    group_id?: number | null
}

export interface PersonaGroupTypes {
    id: number | 'ungrouped'
    name?: string
    personaList: PersonaTypes[]
    created_at: string
    updated_at?: string
}
