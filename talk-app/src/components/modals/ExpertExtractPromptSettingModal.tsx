import React, { useEffect, useState } from 'react'
import LargeModal from '../../../../package/mock-components/LargeModal.tsx'
import AutoResizingTextarea from '../../../../package/mock-components/AutoResizingTextarea.tsx'
import Btn from '../../../../package/mock-components/Btn.tsx'
import { useTranslation } from 'react-i18next'
import { useStore } from '@nanostores/react'
import { currentExpertData } from '@store/store.ts'
import useAnimationClose from '../../../../package/hooks/useAnimationClose'
import CautionShape from '../../../../package/mock-components/shapes/CautionShape'
import type { CreatePersonaDto } from 'src/types/Persona.types'

interface ExpertExtractPromptSettingProps {
    extractionPrompt: string
    setExtractionPrompt: (prompt: string) => void
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void
}
const ExpertExtractPromptSettingModal = ({
    extractionPrompt,
    setExtractionPrompt,
    isOpened,
    setIsOpened,
}: ExpertExtractPromptSettingProps) => {
    const { t } = useTranslation()
    const prompts = useStore(currentExpertData)
    const defaultPrompt = prompts?.gemini_extract_text_prompt ?? ''
    const [prompt, setPrompt] = useState(
        extractionPrompt === '' ? defaultPrompt : extractionPrompt
    )

    return (
        <div>
            {isOpened && (
                <LargeModal
                    title={t('extractPromptSetting.title')}
                    children={(handleLargeModalClose) => (
                        <div className="ModalProps--promptFieldGroup">
                            <p>{t('extractPromptSetting.text')}</p>
                            <p className="prompt-label">
                                {t('extractPromptSetting.prompt.label')}
                            </p>
                            <div className="ModalProps--promptField">
                                <AutoResizingTextarea
                                    value={prompt}
                                    onChange={(e) => {
                                        setPrompt(e.target.value)
                                    }}
                                    minHeight={0}
                                    maxHeight={3000}
                                    singleLine={false}
                                    modifier={'Textarea'}
                                />
                                {prompt !== defaultPrompt && (
                                    <div className="reset">
                                        <Btn
                                            size="sm"
                                            label="デフォルトプロンプトに戻す"
                                            color="secondly"
                                            border="gray"
                                            onClick={() => {
                                                setPrompt(defaultPrompt)
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            {/* <p className="prompt-label">
                                {t('extractPromptSetting.format.label')}
                            </p>
                            <div className="ModalProps--promptField">
                                <AutoResizingTextarea
                                    value={format}
                                    onChange={(e) => {
                                        setFormat(e.target.value)
                                    }}
                                    minHeight={400}
                                    maxHeight={3000}
                                    singleLine={false}
                                    modifier={'Textarea'}
                                />
                                {format !== defaultFormat && (
                                    <div className="reset">
                                        <Btn
                                            size="sm"
                                            label="デフォルフォーマットに戻す"
                                            color="secondly"
                                            border="gray"
                                            onClick={() => {
                                                setFormat(defaultFormat)
                                            }}
                                        />
                                    </div>
                                )}
                            </div> */}
                            <div className="control">
                                <div className="attention">
                                    <div className="shape">
                                        <CautionShape />
                                    </div>
                                    <div>
                                        {t('common.alert.neverDisclosePrompts')}
                                    </div>
                                </div>
                                <div className="buttons">
                                    <Btn
                                        label={t('extractPromptSetting.cancel')}
                                        border="gray"
                                        onClick={handleLargeModalClose}
                                    />
                                    <Btn
                                        label={t('extractPromptSetting.save')}
                                        onClick={() => {
                                            setIsOpened(false)
                                            setExtractionPrompt(prompt)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    onModalClose={() => {
                        setIsOpened(false)
                        setPrompt(extractionPrompt)
                    }}
                />
            )}
        </div>
    )
}

export default ExpertExtractPromptSettingModal
