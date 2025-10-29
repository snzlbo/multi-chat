import React, { useState } from 'react'
import type {
    CreatePersonaDto,
    ImageGenerationModelTypes,
    PersonaTypes,
} from '../types/Persona.types.ts'
import AutoResizingTextarea from '../../../package/mock-components/AutoResizingTextarea'
import PersonaProfile from '@components/PersonaProfile'
import ImageSettingModal from '@components/modals/ImageSettingModal'
import { generateImage } from 'src/server/utils/imageApi.ts'
import { currentExpertData } from '@store/store.ts'
import { useStore } from '@nanostores/react'
import { useTranslation } from 'react-i18next'
import { jsonAnswer } from 'src/server/utils/chatApi.ts'

interface PersonaDetailEditorProps {
    isEdit: boolean
    isDuplicate: boolean
    value: PersonaTypes | null
    draft: CreatePersonaDto | PersonaTypes | null
    setDraft: (draft: CreatePersonaDto | PersonaTypes | null) => void
    setGroupName: (value: string | null) => void
    abortControllerRef: React.MutableRefObject<AbortController | null>
    setImageIsGenerating?: (isGenerating: boolean) => void
}

const PersonaDetailEditor = ({
    isEdit,
    isDuplicate,
    value,
    draft,
    setDraft,
    setGroupName,
    abortControllerRef,
    setImageIsGenerating,
}: PersonaDetailEditorProps) => {
    const { t } = useTranslation()
    const prompts = useStore(currentExpertData)
    const [isImageSettingModalOpened, setIsImageSettingModalOpened] =
        useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const splitString = (value: string = '') => {
        return value.split(/(\n)/)
    }

    const handleGenerateImage = async (
        userInputPrompt?: string,
        signal?: AbortSignal
    ) => {
        setIsGenerating(true)
        setImageIsGenerating?.(true)

        const defaultPrompt = prompts?.img_gen_prompt ?? ''
        const personaProfileDescription = draft?.profile_description ?? ''

        const inputAvatarPrompt = userInputPrompt
            ? `${userInputPrompt}\n${personaProfileDescription}`
            : `${defaultPrompt}\n${personaProfileDescription}`

        const selectedModel: ImageGenerationModelTypes =
            (draft?.img_gen_model ??
                prompts?.img_gen_model ??
                'dall-e-3') as ImageGenerationModelTypes

        await jsonAnswer(inputAvatarPrompt)
            .then(async (imagePrompt: string) => {
                const generatedBlob = await generateImage(
                    imagePrompt,
                    selectedModel,
                    signal
                )
                setDraft({
                    ...draft,
                    name: draft?.name ?? '',
                    other_description: draft?.other_description ?? '',
                    group_id: draft?.group_id ?? null,
                    thumb_file: generatedBlob,
                    img_gen_model: selectedModel,
                    img_gen_prompt: userInputPrompt ?? defaultPrompt,
                })
            })
            .catch((error) => {
                if (error.name === 'AbortError') {
                    console.log('Request aborted')
                } else {
                    console.error('Error:', error)
                }
            })
            .finally(() => {
                setIsGenerating(false)
                setImageIsGenerating?.(false)
            })
    }

    return (
        <div className="h-full">
            <div className="PersonaDetailEditor">
                <div className="profile">
                    <div className="inner">
                        <div className="title">
                            <div className="label">PERSONA</div>
                            <div className="text-sm">
                                {t('personaDetail.title')}
                            </div>
                        </div>
                        <PersonaProfile
                            isEdit={isEdit}
                            isDuplicate={isDuplicate}
                            isGenerating={isGenerating}
                            setGroupName={setGroupName}
                            value={value}
                            draft={draft}
                            setDraft={setDraft}
                            onClickUpdateImage={() =>
                                setIsImageSettingModalOpened(true)
                            }
                        />
                    </div>
                </div>
                <div
                    className={`detail ${isEdit || isDuplicate ? 'edit' : 'default'}`}
                >
                    <div className="grid gap-6 text-sm">
                        <p className="text-grayscale-600">
                            {t('personaDetail.personaDescription.label')}
                        </p>
                        <div className="leading-[1.6]">
                            {isEdit || isDuplicate ? (
                                <div className="update">
                                    <AutoResizingTextarea
                                        value={draft?.profile_description}
                                        onChange={(e) =>
                                            setDraft({
                                                ...draft,
                                                name: draft?.name ?? '',
                                                other_description:
                                                    draft?.other_description ??
                                                    '',
                                                group_id:
                                                    draft?.group_id ?? null,
                                                profile_description:
                                                    e.target.value,
                                            })
                                        }
                                        minHeight={100}
                                        maxHeight={30000}
                                        modifier={''}
                                    />
                                </div>
                            ) : (
                                <div>
                                    {splitString(
                                        value?.profile_description
                                    ).map((string: string, index: number) => {
                                        return string.match(/\n/) ? (
                                            <br key={index} />
                                        ) : (
                                            <span key={index}>{string}</span>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ImageSettingModal
                handleGenerateImage={(prompt) => {
                    abortControllerRef.current = new AbortController()
                    const signal = abortControllerRef.current.signal
                    return handleGenerateImage(prompt, signal)
                }}
                draft={draft}
                setDraft={setDraft}
                isOpened={isImageSettingModalOpened}
                setIsOpened={setIsImageSettingModalOpened}
            />
        </div>
    )
}

export default PersonaDetailEditor
