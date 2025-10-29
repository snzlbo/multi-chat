import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DialogModal from '../../../../package/mock-components/DialogModal.tsx'
import Btn from '../../../../package/mock-components/Btn.tsx'
import DropZone, {
    type UploadImageProps,
} from '../../../../package/mock-components/DropZone.tsx'
import SuggestForm from '@components/ui/SuggestForm.tsx'
import type { CreatePersonaDto } from '../../types/Persona.types.ts'
import { getPersonasFromFile } from 'src/server/database/logic.ts'
import { createGroup, listGroups } from 'src/server/database/group.ts'
import { createPersona } from 'src/server/database/persona.ts'
import { createSearchHistory } from 'src/server/database/searchHistory.ts'
import { Trans, useTranslation } from 'react-i18next'
import { useStore } from '@nanostores/react'
import { currentGroups } from '@store/store.ts'

interface PersonaImportModalProps {
    isOpened: boolean
    setIsOpened: (isOpened: boolean) => void
    fetch: () => Promise<void>
}

const PersonaImportModal = ({
    isOpened,
    setIsOpened,
    fetch,
}: PersonaImportModalProps) => {
    const { t } = useTranslation()
    const groups = useStore(currentGroups)
    const [isLoaded, setIsLoaded] = useState(false)
    const [files, setFiles] = useState<UploadImageProps[]>([])
    const [importedPersonas, setImportedPersonas] = useState<
        CreatePersonaDto[]
    >([])
    const [newGroupName, setNewGroupName] = useState('')

    const handleImport = useCallback(async (files: UploadImageProps[]) => {
        try {
            const personas: CreatePersonaDto[] = []
            for (const file of files) {
                const personasFromFile = await getPersonasFromFile(file)
                personas.push(...personasFromFile)
            }
            setImportedPersonas(personas)
        } catch (error) {
            console.error('Error importing personas:', error)
        }
    }, [])

    const handleCreatePersona = async (): Promise<void> => {
        try {
            let groupId: number | null = null
            if (newGroupName) {
                const existingGroup = groups.find(
                    (group) => group.name === newGroupName
                )
                groupId = existingGroup
                    ? existingGroup.id
                    : await createGroup(newGroupName)
            }

            for (const persona of importedPersonas) {
                const payload: CreatePersonaDto = {
                    ...persona,
                    group_id: groupId,
                }
                await createPersona(payload)
            }
            if (groupId && newGroupName && newGroupName?.trim() !== '') {
                await createSearchHistory(newGroupName)
            }
            const resp = await listGroups()
            currentGroups.set(resp)
            await fetch()
        } catch (error) {
            console.error('Error creating persona:', error)
        }
    }
    useEffect(() => {
        if (files.length) {
            handleImport(files)
        }
    }, [files, handleImport])

    return (
        <div>
            {isOpened && (
                <DialogModal
                    label={<div>{t('personaImport.title')}</div>}
                    message={
                        <div className="ModalProps--personaImport">
                            {!isLoaded ? (
                                <div className="upload-step">
                                    <DropZone
                                        files={files}
                                        setFiles={setFiles}
                                        dropZoneOption={{
                                            accept: {
                                                'application/json': ['.json'],
                                            },
                                            maxFiles: 1,
                                        }}
                                        preview={false}
                                    />
                                    <p className="notes">
                                        {t('personaImport.uploadStep.notes')}
                                    </p>
                                </div>
                            ) : (
                                <div className="import-step">
                                    <div className="top">
                                        <p className="text-left">
                                            <Trans
                                                i18nKey={
                                                    'personaImport.importStep.text'
                                                }
                                                values={{
                                                    n: importedPersonas.length,
                                                }}
                                            />
                                        </p>
                                        <div className="personas">
                                            <div className="list">
                                                {importedPersonas.map(
                                                    (persona, idx) => (
                                                        <div
                                                            className="persona"
                                                            key={idx}
                                                        >
                                                            <div className="thumbnail">
                                                                <img
                                                                    src={
                                                                        persona.thumb_file &&
                                                                        URL.createObjectURL(
                                                                            persona.thumb_file as Blob
                                                                        )
                                                                    }
                                                                    loading="lazy"
                                                                    width="48"
                                                                    height="48"
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="texts">
                                                                <div className="name">
                                                                    {
                                                                        persona.name
                                                                    }
                                                                </div>
                                                                <div className="other">
                                                                    {
                                                                        persona.other_description
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bottom">
                                        <p className="text-left">
                                            {t(
                                                'personaImport.importStep.setGroup'
                                            )}
                                        </p>
                                        <SuggestForm
                                            onChange={(value) => {
                                                setNewGroupName(value)
                                            }}
                                            onFocus={() => {}}
                                            suggestWords={groups.map(
                                                (group) => group.name
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    }
                    control={(handleDialogModalClose) => (
                        <div className="buttons">
                            {!isLoaded && (
                                <Btn
                                    label={t(
                                        'personaImport.uploadStep.confirm'
                                    )}
                                    onClick={() => setIsLoaded(true)}
                                    disabled={files.length === 0}
                                />
                            )}
                            {isLoaded && (
                                <Btn
                                    label={t('personaImport.importStep.back')}
                                    color="gray"
                                    onClick={() => setIsLoaded(false)}
                                />
                            )}
                            {isLoaded && (
                                <Btn
                                    label={t('personaImport.importStep.import')}
                                    onClick={async () => {
                                        await handleCreatePersona()
                                        handleDialogModalClose()
                                    }}
                                />
                            )}
                        </div>
                    )}
                    onModalClose={() => {
                        setFiles([])
                        setImportedPersonas([])
                        setIsLoaded(false)
                        setIsOpened(false)
                    }}
                />
            )}
        </div>
    )
}

export default PersonaImportModal
