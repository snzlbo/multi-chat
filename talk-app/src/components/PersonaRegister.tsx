import React, { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollToPlugin)
import {
    BackfaceScrollingDisabled,
    bottomAppBarOpened,
    homeOpened,
    homePositionShift,
    personaRegisterOpened,
    currentExpertData,
    language,
} from '@store/store.ts'
import { useStore } from '@nanostores/react'
import type { CreatePersonaDto, PersonaTypes } from '../types/Persona.types.ts'
import LargeCrossShape from 'package/mock-components/shapes/LargeCrossShape'
import Btn from 'package/mock-components/Btn'
import useAnimationClose from 'package/hooks/useAnimationClose'
import ImageSettingModal from '@components/modals/ImageSettingModal'
import KeywordToggle from 'package/mock-components/KeywordToggle'
import { type UploadImageProps } from 'package/mock-components/DropZone'
import PersonaRegisterExtract from '@components/PersonaRegisterExtract'
import PersonaRegisterEditor from '@components/PersonaRegisterEditor'
import DialogModal from 'package/mock-components/DialogModal'
import ExpertExtractPromptSettingModal from '@components/modals/ExpertExtractPromptSettingModal'
import { useCrossFadeOutSetting } from 'package/hooks/useCrossFadeOutSetting.ts'
import { generateImage, image2Text } from 'src/server/utils/imageApi.ts'
import { jsonAnswer } from 'src/server/utils/chatApi.ts'
import { Trans, useTranslation } from 'react-i18next'
import { EXTRACT_NAME_DESC_PROMPT } from 'src/static/prompt.ts'
import { getExpertMode } from 'src/server/database/expert.ts'
import { compressImage } from 'src/server/utils/imageApi.ts'
import { base64ToBlob } from 'src/server/database/logic.ts'

interface PersonaRegisterProps {
    onCreate: (persona: CreatePersonaDto, group_name?: string) => Promise<void>
}

const PersonaRegister = ({ onCreate }: PersonaRegisterProps) => {
    const { t, i18n } = useTranslation()
    const expertData = useStore(currentExpertData)
    const registerRef = useRef<HTMLDivElement>(null)
    const layoutRef = useRef<HTMLDivElement>(null)
    const isPersonaRegisterOpened = useStore(personaRegisterOpened)
    const [isPromptExtracting, setIsPromptExtracting] = useState(false)
    const [isPersonaGenerating, setIsPersonaGenerating] = useState(false)
    const [extractionSource, setExtractionSource] = useState<
        UploadImageProps[]
    >([])
    // Abort Controller for in processing api call
    const abortControllerRef = useRef<AbortController | null>(null)

    // 手動入力モードとファイル入力モードそれぞれの状態の定義
    const [isFileMode, setIsFileMode] = useState(false)
    const [manualPrompt, setManualPrompt] = useState('')
    const [manualDraft, setManualDraft] = useState<CreatePersonaDto | null>(
        null
    )
    const [filePrompt, setFilePrompt] = useState('')
    const [fileDraft, setFileDraft] = useState<CreatePersonaDto | null>(null)
    const [isImageSettingModalOpened, setIsImageSettingModalOpened] =
        useState(false)
    const [isEditConfirmModalOpened, setIsEditConfirmModalOpened] =
        useState(false)
    const [isResetConfirmModalOpened, setIsResetConfirmModalOpened] =
        useState(false)
    const [isExpertSettingModalOpened, setIsExpertSettingModalOpened] =
        useState(false)
    const [isCloseConfirmModalOpened, setIsCloseConfirmModalOpened] =
        useState(false)
    const [isExtractedOnce, setIsExtractedOnce] = useState(false)
    const [extractionPrompt, setExtractionPrompt] = useState(
        expertData?.gemini_extract_text_prompt ?? ''
    )
    const [groupName, setGroupName] = useState<string | null>(null)

    //isFileModeがtrueかどうかで使用する状態を切り替える
    const draft = useMemo(
        () => (isFileMode ? fileDraft : manualDraft),
        [isFileMode, fileDraft, manualDraft]
    )
    const setDraft = useMemo(
        () => (isFileMode ? setFileDraft : setManualDraft),
        [isFileMode, setFileDraft, setManualDraft]
    )
    const prompt = useMemo(
        () => (isFileMode ? filePrompt : manualPrompt),
        [isFileMode, filePrompt, manualPrompt]
    )

    useEffect(() => {
        const fetchExpertData = async () => {
            const expertData = await getExpertMode()
            currentExpertData.set(expertData)
        }
        fetchExpertData()
    }, [isPersonaRegisterOpened])

    useEffect(() => {
        setExtractionPrompt(
            draft?.format_extraction_prompt ??
                expertData?.gemini_extract_text_prompt ??
                ''
        )
    }, [expertData, draft])

    const imageGenPrompt = useMemo(() => {
        return expertData?.img_gen_prompt ?? ''
    }, [expertData])

    const setPrompt = (prompt: string) =>
        isFileMode ? setFilePrompt(prompt) : setManualPrompt(prompt)

    const currentLanguage = useStore(language)

    const onBeforeClose = () => {
        useCrossFadeOutSetting(registerRef, homePositionShift)
        homeOpened.set(true)
        bottomAppBarOpened.set(true)
    }

    const onClose = () => {
        personaRegisterOpened.set(false)
        setIsFileMode(false)
        setIsExtractedOnce(false)
        setExtractionSource([])
        setManualPrompt(t('dummy.personaRegisterDefaultPrompt'))
        setManualDraft(null)
        setIsCloseConfirmModalOpened(false)
        setFilePrompt(
            '#画像から抽出したプロンプトをここに表示\n\n' +
                t('dummy.personaRegisterDefaultPrompt')
        )
        setIsPersonaGenerating(false)
        setIsPromptExtracting(false)
        setFileDraft(null)
    }

    const { isCloseAnimating, handleClose, handleAnimationEnd } =
        useAnimationClose(onBeforeClose, onClose)

    const handleOnClose = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        if (isPersonaGenerating || isPromptExtracting) {
            setIsCloseConfirmModalOpened(true)
            return
        }

        handleClose()
    }

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    const switchInputMode = (mode: 'manual' | 'file') => {
        switch (mode) {
            case 'manual':
                setExtractionSource([])
                setIsFileMode(false)
                break
            case 'file':
                setIsFileMode(true)
                break
        }
    }

    const handleExtract = async () => {
        if (!extractionSource[0]) {
            console.error('No file uploaded.')
            return
        }

        if (layoutRef.current) {
            gsap.to(window, {
                duration: 0.6,
                ease: 'power2.out',
                scrollTo: {
                    y: layoutRef.current,
                    offsetY: 30,
                },
            })
        }

        setFilePrompt('')
        setIsPromptExtracting(true)

        try {
            const extractedText = await image2Text(
                extractionSource[0],
                extractionPrompt
            )

            if (extractedText) {
                setFilePrompt(extractedText)
            }
        } catch (error) {
            console.error('Error extracting text:', error)
        } finally {
            setIsPromptExtracting(false)
            setIsExtractedOnce(true)
        }
    }

    const handleGenerateImage = async (profile_description?: string) => {
        setIsPersonaGenerating(true)

        abortControllerRef.current = new AbortController()
        const signal = abortControllerRef.current.signal

        const inputAvatarPrompt =
            imageGenPrompt + '\n' + (profile_description ?? '')
        await jsonAnswer(inputAvatarPrompt)
            .then(async (imagePrompt: string) => {
                const generatedBlob = await generateImage(
                    imagePrompt,
                    expertData?.img_gen_model ??
                        draft?.img_gen_model ??
                        'dall-e-3',
                    signal
                )
                const personal_info_extract_prompt = `${EXTRACT_NAME_DESC_PROMPT}\n${profile_description}`
                await jsonAnswer(personal_info_extract_prompt).then((res) => {
                    const { name, description } = JSON.parse(res)
                    setDraft((prev) => {
                        return {
                            ...prev,
                            name: name,
                            other_description: description,
                            group_id: prev?.group_id ?? null,
                            thumb_file: generatedBlob,
                            img_gen_prompt: imageGenPrompt,
                        }
                    })
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
                setIsPersonaGenerating(false)
            })
    }

    const handleGenerate = async () => {
        setIsPersonaGenerating(true)
        const profile_description = prompt // prompt is already set to filePrompt after extraction

        await handleGenerateImage(profile_description)
    }

    const handleRegisterSubmit = async () => {
        if (draft) {
            let compressedOriginalFile: Blob | undefined = undefined

            if (extractionSource && extractionSource[0]) {
                const file = extractionSource[0]
                compressedOriginalFile = await compressImage(file, 0.5)
            }

            await onCreate(
                {
                    ...draft,
                    extraction_prompt: extractionPrompt,
                    profile_description: prompt,
                    original_file: compressedOriginalFile,
                },
                groupName ?? undefined
            )
        }
        handleClose()
    }

    useEffect(() => {
        setManualPrompt(t('dummy.personaRegisterDefaultPrompt'))
    }, [i18n, currentLanguage])

    useEffect(() => {
        if (isExpertSettingModalOpened) {
            BackfaceScrollingDisabled.set(true)
            return
        }
        BackfaceScrollingDisabled.set(false)
    }, [isExpertSettingModalOpened])

    return (
        <div>
            {isPersonaRegisterOpened && (
                <div>
                    <div
                        ref={registerRef}
                        className={`SettingScreen ${isCloseAnimating ? 'SettingScreen--close' : 'SettingScreen--open'}`}
                        onAnimationEnd={handleAnimationEnd}
                    >
                        <div className="PersonaRegister">
                            <div className="head">
                                <h2 className="title">
                                    {t('personaRegister.title')}
                                </h2>
                                <div className="grid gap-3">
                                    <div className="toggle">
                                        <KeywordToggle
                                            value={!isFileMode}
                                            trueOption={{
                                                label: t(
                                                    'personaRegister.manualMode.label'
                                                ),
                                                onSelect: () => {
                                                    switchInputMode('manual')
                                                },
                                            }}
                                            falseOption={{
                                                label: t(
                                                    'personaRegister.fileMode.label'
                                                ),
                                                onSelect: () => {
                                                    switchInputMode('file')
                                                },
                                            }}
                                        />
                                    </div>
                                    {!isFileMode && (
                                        <div className="guide">
                                            {!manualDraft ? (
                                                <p>
                                                    {t(
                                                        'personaRegister.manualMode.guide1'
                                                    )}
                                                </p>
                                            ) : (
                                                <p>
                                                    <Trans
                                                        i18nKey={
                                                            'personaRegister.manualMode.guide2'
                                                        }
                                                    />
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isFileMode && (
                                <PersonaRegisterExtract
                                    extractionSource={extractionSource}
                                    setExtractionSource={setExtractionSource}
                                    isPromptExtracting={isPromptExtracting}
                                    handleExtract={handleExtract}
                                    setIsExpertSettingModalOpened={
                                        setIsExpertSettingModalOpened
                                    }
                                />
                            )}

                            <div ref={layoutRef}>
                                <PersonaRegisterEditor
                                    setGroupName={setGroupName}
                                    draft={draft}
                                    setDraft={setDraft}
                                    prompt={prompt}
                                    setPrompt={setPrompt}
                                    isPromptExtracting={isPromptExtracting}
                                    isPersonaGenerating={isPersonaGenerating}
                                    isFileMode={isFileMode}
                                    isExtractedOnce={isExtractedOnce}
                                    setIsImageSettingModalOpened={
                                        setIsImageSettingModalOpened
                                    }
                                    setIsEditConfirmModalOpened={
                                        setIsEditConfirmModalOpened
                                    }
                                />
                            </div>
                        </div>
                        <button
                            className="IconBtn close"
                            onClick={handleOnClose}
                        >
                            <LargeCrossShape />
                        </button>

                        <div
                            className={`BottomNavigation ${draft ? 'navigation--edit' : ''}`}
                        >
                            <div className="navigation">
                                <div
                                    className={`group group--center ${!draft ? 'group--show' : 'group--hide'}`}
                                >
                                    <Btn
                                        label={t(
                                            'personaRegister.common.generate'
                                        )}
                                        color="primary"
                                        onClick={handleGenerate}
                                        disabled={
                                            isPersonaGenerating ||
                                            (isFileMode
                                                ? filePrompt.trim() === ''
                                                : manualPrompt?.trim() === '')
                                        }
                                    />
                                </div>
                                <div
                                    className={`group group--edit ${draft ? 'group--show' : 'group--hide'}`}
                                >
                                    <Btn
                                        size="sm"
                                        label={t('personaRegister.common.back')}
                                        color="secondly"
                                        border="none"
                                        onClick={() =>
                                            setIsResetConfirmModalOpened(true)
                                        }
                                    />
                                    <Btn
                                        size="sm"
                                        label={t(
                                            'personaRegister.common.confirm'
                                        )}
                                        color="quaternary"
                                        border="none"
                                        onClick={handleRegisterSubmit}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <ImageSettingModal
                        handleGenerateImage={handleGenerateImage}
                        isOpened={isImageSettingModalOpened}
                        setIsOpened={setIsImageSettingModalOpened}
                        draft={draft}
                        setDraft={setDraft}
                    />

                    {/* 以下、モーダル要素 */}

                    {
                        // 編集中に閉じようとしたときのダイアログ
                        isCloseConfirmModalOpened && (
                            <DialogModal
                                message={
                                    <p>
                                        <Trans
                                            i18nKey={
                                                'personaDetail.closeConfirmModal.text'
                                            }
                                        />
                                    </p>
                                }
                                control={(handleDialogModalClose) => (
                                    <div className="buttons">
                                        <Btn
                                            label={t(
                                                'personaDetail.closeConfirmModal.no'
                                            )}
                                            color="secondly"
                                            border="gray"
                                            onClick={handleDialogModalClose}
                                        />
                                        <Btn
                                            label={t(
                                                'personaDetail.closeConfirmModal.close'
                                            )}
                                            onClick={() => {
                                                handleClose()
                                                homeOpened.set(true)
                                                bottomAppBarOpened.set(true)
                                            }}
                                        />
                                    </div>
                                )}
                                onModalClose={() =>
                                    setIsCloseConfirmModalOpened(false)
                                }
                            />
                        )
                    }

                    {isEditConfirmModalOpened && (
                        <DialogModal
                            label={
                                <div>
                                    {t(
                                        'personaRegister.editConfirmModal.title'
                                    )}
                                </div>
                            }
                            message={
                                <p>
                                    <Trans
                                        i18nKey={
                                            'personaRegister.editConfirmModal.message'
                                        }
                                    />
                                </p>
                            }
                            control={(handleDialogModalClose) => (
                                <div>
                                    <div className="buttons">
                                        <Btn
                                            label={t(
                                                'personaRegister.editConfirmModal.cancel'
                                            )}
                                            border="gray"
                                            onClick={handleDialogModalClose}
                                        />
                                        <Btn
                                            label={t(
                                                'personaRegister.editConfirmModal.change'
                                            )}
                                            onClick={() => {
                                                setDraft(null)
                                                handleDialogModalClose()
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            onModalClose={() =>
                                setIsEditConfirmModalOpened(false)
                            }
                        />
                    )}
                    {isResetConfirmModalOpened && (
                        <DialogModal
                            message={
                                <p>
                                    <Trans
                                        i18nKey={
                                            'personaRegister.resetConfirmModal.message'
                                        }
                                    />
                                </p>
                            }
                            control={(handleDialogModalClose) => (
                                <div>
                                    <div className="buttons">
                                        <Btn
                                            label={t(
                                                'personaRegister.resetConfirmModal.no'
                                            )}
                                            border="gray"
                                            onClick={handleDialogModalClose}
                                        />
                                        <Btn
                                            label={t(
                                                'personaRegister.resetConfirmModal.yes'
                                            )}
                                            onClick={() => {
                                                setDraft(null)
                                                handleDialogModalClose()
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            onModalClose={() =>
                                setIsResetConfirmModalOpened(false)
                            }
                        />
                    )}

                    <ExpertExtractPromptSettingModal
                        extractionPrompt={extractionPrompt}
                        setExtractionPrompt={setExtractionPrompt}
                        isOpened={isExpertSettingModalOpened}
                        setIsOpened={setIsExpertSettingModalOpened}
                    />
                </div>
            )}
        </div>
    )
}

export default PersonaRegister
