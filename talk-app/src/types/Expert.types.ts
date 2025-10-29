import type { BaseEntity } from './main'
import {
    PERSONA_CHAT_PROMPT,
    GEMINI_EXTRACT_TEXT_PROMPT,
    DALLE_PROMPT,
} from 'src/static/prompt.ts'
import type { ImageGenerationModelTypes } from './Persona.types'

export interface ExpertMode extends BaseEntity {
    id: number
    is_enabled: boolean
    chat_prompt: string
    chat_model: string
    gemini_extract_text_prompt: string
    format_extraction_prompt: string
    img_gen_prompt: string
    img_gen_model: ImageGenerationModelTypes
}

export interface UpdateExpertModeDto extends BaseEntity {
    id: number
    is_enabled?: boolean
    chat_prompt?: string
    chat_model?: string
    gemini_extract_text_prompt?: string
    format_extraction_prompt?: string
    img_gen_prompt?: string
    img_gen_model?: string
}

export const defaultExpertModeValues = {
    chat_prompt: PERSONA_CHAT_PROMPT,
    chat_model: 'gpt-4o',
    img_gen_prompt: DALLE_PROMPT,
    img_gen_model: 'dall-e-3',
    gemini_extract_text_prompt: GEMINI_EXTRACT_TEXT_PROMPT,
    is_enabled: false,
}
