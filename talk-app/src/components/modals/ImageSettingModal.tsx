import React, { useEffect, useMemo, useState } from 'react'
import DialogModal from '../../../../package/mock-components/DialogModal.tsx'
import Btn from '../../../../package/mock-components/Btn.tsx'
import DropZone, {
    type UploadImageProps,
} from '../../../../package/mock-components/DropZone.tsx'
import KeywordToggle from '../../../../package/mock-components/KeywordToggle.tsx'
import Select from '../../../../package/mock-components/Select.tsx'
import AutoResizingTextarea from '../../../../package/mock-components/AutoResizingTextarea.tsx'
import type {
    CreatePersonaDto,
    ImageGenerationModelTypes,
    PersonaTypes,
} from 'src/types/Persona.types.ts'
import { useStore } from '@nanostores/react'
import { currentExpertData, exportMode } from '@store/store'
import { base64ToBlob } from 'src/server/database/logic'
import { Trans, useTranslation } from 'react-i18next'
import { DALLE_PROMPT } from 'src/static/prompt'
import { compressImage } from 'src/server/utils/imageApi'

interface ImageSettingModalProps {
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void
    draft: CreatePersonaDto | PersonaTypes | null
    setDraft: (draft: CreatePersonaDto | PersonaTypes | null) => void
    handleGenerateImage: (profile_description?: string) => Promise<void>
}

const ImageSettingModal = ({
    isOpened,
    setIsOpened,
    draft,
    setDraft,
    handleGenerateImage,
}: ImageSettingModalProps) => {
    const { t } = useTranslation()
    const prompts = useStore(currentExpertData)
    const isExpertMode = useStore(exportMode)
    const expertData = currentExpertData.get()
    const defaultPrompt = useMemo(() => {
        return prompts?.img_gen_prompt
    }, [prompts])
    const [isFileMode, setIsFileMode] = useState(true)
    const [files, setFiles] = useState<UploadImageProps[]>([])
    const [prompt, setPrompt] = useState('')

    useEffect(() => {
        if (isOpened) {
            setPrompt(draft?.img_gen_prompt ?? defaultPrompt ?? DALLE_PROMPT)
        }
    }, [isOpened])

    useEffect(() => {
        if (isOpened && draft && !draft.img_gen_model) {
            setDraft({
                ...draft,
                img_gen_model: (expertData?.img_gen_model ??
                    'dall-e-3') as ImageGenerationModelTypes,
            })
        }
    }, [isOpened])

    const setModel = (value: ImageGenerationModelTypes) => {
        setDraft({
            ...draft,
            name: draft?.name ?? '',
            other_description: draft?.other_description ?? '',
            group_id: draft?.group_id ?? null,
            img_gen_model: value,
        })
    }

    const fileSizeExceeded = useMemo(() => {
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0)
        return totalSize > 5 * 1024 * 1024 // 5MB in bytes
    }, [files])

    const handleUploadImage = () => {
        if (files && files[0]) {
            const reader = new FileReader()

            reader.onload = async (e) => {
                if (typeof e.target?.result === 'string') {
                    const blob = await base64ToBlob(e.target.result)
                    const compressedBlob = await compressImage(blob, 0.5)
                    setDraft({
                        ...draft,
                        name: draft?.name ?? '',
                        other_description: draft?.other_description ?? '',
                        group_id: draft?.group_id ?? null,
                        thumb_file: compressedBlob,
                    })
                }
            }

            reader.readAsDataURL(files[0])
        }
    }

    useEffect(() => {
        setFiles([])
    }, [isFileMode])

    return (
        <div>
            {isOpened && (
                <DialogModal
                    label={<div>{t('imageSetting.title')}</div>}
                    message={
                        <div className="ModalProps--toggleContents">
                            <div className="toggle-switch">
                                <KeywordToggle
                                    value={isFileMode}
                                    trueOption={{
                                        label: t('imageSetting.fileMode.label'),
                                        onSelect: () => {
                                            setIsFileMode(true)
                                        },
                                    }}
                                    falseOption={{
                                        label: t(
                                            'imageSetting.regenerateMode.label'
                                        ),
                                        onSelect: () => {
                                            setIsFileMode(false)
                                        },
                                    }}
                                />
                            </div>

                            {isFileMode ? (
                                <div className="ModalProps--dropZone">
                                    <DropZone
                                        files={files}
                                        setFiles={setFiles}
                                        dropZoneOption={{
                                            accept: {
                                                'image/png': ['.png'],
                                                'image/jpeg': ['.jpe', '.jpeg'],
                                                'image/webp': ['.webp'],
                                            },
                                            maxFiles: 1,
                                        }}
                                    />
                                    {!fileSizeExceeded ? (
                                        <p className="notes">
                                            <Trans
                                                i18nKey={
                                                    'imageSetting.fileMode.notes'
                                                }
                                                values={{ size: '5' }}
                                            />
                                        </p>
                                    ) : (
                                        <p className="notes">
                                            {t(
                                                'imageSetting.fileMode.exceededNotes',
                                                { size: '5' }
                                            )}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                isExpertMode && (
                                    <div className="ModalProps--promptWithSettings">
                                        <div className="setting-item">
                                            <div className="text-sm">
                                                {t(
                                                    'imageSetting.regenerateMode.selectModel.label'
                                                )}
                                            </div>
                                            <div>
                                                <Select
                                                    defaultValue={
                                                        expertData?.img_gen_model ??
                                                        'dall-e-3'
                                                    }
                                                    options={[
                                                        {
                                                            label: 'Dall-E 3',
                                                            value: 'dall-e-3',
                                                            onSelect: () => {
                                                                setModel(
                                                                    'dall-e-3'
                                                                )
                                                            },
                                                        },
                                                        {
                                                            label: 'Imagen 3.0',
                                                            value: 'imagen-3.0-generate-002',
                                                            onSelect: () => {
                                                                setModel(
                                                                    'imagen-3.0-generate-002'
                                                                )
                                                            },
                                                        },
                                                        {
                                                            label: 'GPT Image 1',
                                                            value: 'gpt-image-1',
                                                            onSelect: () => {
                                                                setModel(
                                                                    'gpt-image-1'
                                                                )
                                                            },
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                        <div className="ModalProps--promptField">
                                            <AutoResizingTextarea
                                                value={prompt}
                                                onChange={(e) => {
                                                    setPrompt(e.target.value)
                                                }}
                                                minHeight={216}
                                                maxHeight={3000}
                                                singleLine={false}
                                                modifier={'Textarea'}
                                            />
                                            {prompt !== defaultPrompt && (
                                                <div className="reset">
                                                    <Btn
                                                        size="sm"
                                                        label={t(
                                                            'imageSetting.regenerateMode.revert'
                                                        )}
                                                        color="secondly"
                                                        border="gray"
                                                        onClick={() => {
                                                            setPrompt(
                                                                defaultPrompt ||
                                                                    DALLE_PROMPT
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    }
                    control={(handleDialogModalClose) => (
                        <div className="buttons">
                            <Btn
                                label={t('imageSetting.common.confirm')}
                                onClick={() => {
                                    if (isFileMode) {
                                        if (
                                            fileSizeExceeded ||
                                            files.length === 0
                                        ) {
                                            return
                                        }
                                        handleUploadImage()
                                    } else {
                                        setDraft({
                                            ...draft,
                                            name: draft?.name ?? '',
                                            other_description:
                                                draft?.other_description ?? '',
                                            group_id: draft?.group_id ?? null,
                                            img_gen_prompt: prompt,
                                        })
                                        handleGenerateImage(prompt)
                                    }
                                    handleDialogModalClose()
                                }}
                                disabled={
                                    isFileMode &&
                                    (files.length === 0 || fileSizeExceeded)
                                }
                            />
                        </div>
                    )}
                    onModalClose={() => {
                        setFiles([])
                        setPrompt('')
                        setIsOpened(false)
                    }}
                />
            )}
        </div>
    )
}

export default ImageSettingModal
