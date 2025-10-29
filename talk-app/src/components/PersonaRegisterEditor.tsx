import React, { useEffect } from 'react'
import type { CreatePersonaDto, PersonaTypes } from '../types/Persona.types.ts'
import LoadingDotShape from 'talk-app/src/components/shapes/LoadingDotsShape'
import TripleArrowShape from '@components/shapes/TripleArrowShape'
import PersonaProfile from '@components/PersonaProfile'
import { useTranslation } from 'react-i18next'

interface PersonaRegisterEditorProps {
    draft: CreatePersonaDto | null
    setDraft: (draft: CreatePersonaDto) => void
    prompt: string
    setPrompt: (prompt: string) => void
    isPromptExtracting: boolean
    isPersonaGenerating: boolean
    isFileMode: boolean
    isExtractedOnce: boolean
    setGroupName: (value: string | null) => void
    setIsImageSettingModalOpened: (isImageSettingModalOpened: boolean) => void
    setIsEditConfirmModalOpened: (isEditConfirmModalOpened: boolean) => void
}
const PersonaRegisterEditor = ({
    draft,
    setDraft,
    prompt,
    setPrompt,
    isPromptExtracting,
    isPersonaGenerating,
    isFileMode,
    isExtractedOnce,
    setGroupName,
    setIsImageSettingModalOpened,
    setIsEditConfirmModalOpened,
}: PersonaRegisterEditorProps) => {
    const { t } = useTranslation()
    return (
        <div className="editor">
            <p className="label">
                {t('personaRegister.personaDescription.label')}
                <br />
                <span className="notes">
                    {t('personaRegister.personaDescription.notes')}
                </span>
            </p>
            <div
                className={`prompt ${isPromptExtracting ? 'prompt--extracting' : ''}`}
            >
                <textarea
                    className={'Textarea Textarea--grayscale-100'}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={
                        (isFileMode && !isExtractedOnce) || isPersonaGenerating
                    }
                ></textarea>
                <div
                    className={`dot ${isPromptExtracting ? 'dot--extracting' : ''}`}
                >
                    <LoadingDotShape />
                </div>
                {draft && (
                    <button
                        className="back"
                        onClick={() => setIsEditConfirmModalOpened(true)}
                    ></button>
                )}
            </div>
            <div className="edit">
                <div className="divider">
                    <div className="arrow">
                        <TripleArrowShape />
                    </div>
                </div>
                <div className="profile">
                    <PersonaProfile
                        setGroupName={setGroupName}
                        isEdit={true}
                        isDuplicate={false}
                        isGenerating={isPersonaGenerating}
                        value={null}
                        draft={draft}
                        setDraft={setDraft}
                        onClickUpdateImage={() =>
                            setIsImageSettingModalOpened(true)
                        }
                    />
                </div>
            </div>
        </div>
    )
}

export default PersonaRegisterEditor
