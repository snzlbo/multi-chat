import { getExpertMode } from './expert.ts'
import type {
    CreatePersonaDto,
    PersonaTypes,
} from '../../types/Persona.types.ts'
import { createGroup, listGroups } from './group.ts'
import { createPersona, getPersonaById } from './persona.ts'
import { DummyPersonaData } from '@data/persona.data.ts'
import PersonaImportModal from '@components/modals/PersonaImportModal.tsx'

// Converts a base64-encoded image string to a Blob object
export const base64ToBlob = async (base64Image: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        try {
            const byteChars = atob(base64Image.split(',')[1])
            const byteArray = new Uint8Array(byteChars.length)

            for (let i = 0; i < byteChars.length; i++) {
                byteArray[i] = byteChars.charCodeAt(i)
            }
            resolve(new Blob([byteArray], { type: 'image/png' }))
        } catch (error) {
            reject('Error converting base64 to Blob')
        }
    })
}

// Converts a Blob object to a base64-encoded string
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result)
            } else {
                reject('Error converting Blob to base64')
            }
        }

        reader.onerror = () => {
            reject('Error reading the Blob')
        }

        reader.readAsDataURL(blob)
    })
}

// Reads a JSON file containing persona data and converts it into CreatePersonaDto objects
export const getPersonasFromFile = async (
    file: File
): Promise<CreatePersonaDto[]> => {
    return new Promise((resolve, reject) => {
        if (!(file instanceof Blob)) {
            console.error('Expected a File or Blob object')
            reject('Invalid file type')
            return
        }

        const reader = new FileReader()

        reader.onload = async () => {
            try {
                if (typeof reader.result === 'string') {
                    const data = JSON.parse(reader.result)
                    const personas: CreatePersonaDto[] = []
                    const prompts = await getExpertMode()

                    for (const persona of data.personas) {
                        const thumb_file = persona.profile_image_base64
                            ? await base64ToBlob(persona.profile_image_base64)
                            : undefined
                        const payload = {
                            name: persona.name,
                            profile_description: persona.profile_description,
                            other_description: persona.other_description,
                            extraction_prompt:
                                persona.extraction_prompt ||
                                prompts?.gemini_extract_text_prompt,
                            chat_prompt:
                                persona.chat_prompt || prompts?.chat_prompt,
                            img_gen_model: persona.img_gen_model,
                            img_gen_prompt:
                                persona.img_gen_prompt ||
                                prompts?.img_gen_prompt,
                            group_id: persona.group_id ?? null,
                            thumb_file,
                        } as CreatePersonaDto

                        personas.push(payload)
                    }

                    resolve(personas)
                } else {
                    reject('File content is not a string')
                }
            } catch (error) {
                reject('Error parsing JSON')
            }
        }

        reader.onerror = () => {
            reject('Error reading the file')
        }

        reader.readAsText(file)
    })
}

// Exports selected personas as a JSON Blob, including their images encoded in base64
export const exportPersonas = async (personaIds: number[]): Promise<Blob> => {
    try {
        const personas = await Promise.all(
            personaIds.map(async (id) => {
                const persona = await getPersonaById(id)
                if (persona) {
                    const profile_image_base64 = persona.thumb_file
                        ? await blobToBase64(persona.thumb_file)
                        : undefined
                    return {
                        id: persona.id,
                        name: persona.name,
                        other_description: persona.other_description,
                        profile_description: persona.profile_description,
                        model: persona.img_gen_model,
                        extraction_prompt: persona.extraction_prompt,
                        chat_prompt: persona.chat_prompt,
                        img_gen_prompt: persona.img_gen_prompt,
                        img_gen_model: persona.img_gen_model,
                        created_at: persona.created_at,
                        profile_image_base64,
                    }
                }
                return null
            })
        )

        const validPersonas = personas.filter((persona) => persona !== null)

        if (validPersonas.length === 0) {
            throw new Error('No personas found for the given IDs')
        }

        const jsonString = JSON.stringify({ personas: validPersonas }, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })

        return blob
    } catch (error) {
        throw new Error('Error exporting personas')
    }
}

// Creates default personas and assigns them to a default group
export const createDefaultPersonas = async (): Promise<void> => {
    const groupId = await createGroup('サンプルペルソナ')
    DummyPersonaData.forEach(async (persona) => {
        await createPersona({ ...persona, group_id: groupId })
    })
}
