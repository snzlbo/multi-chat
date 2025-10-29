import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import useAnimationClose from '../../../package/hooks/useAnimationClose'
import {
    personaDetailOpened,
    personaTalkOpened,
    bottomAppBarOpened,
    homeOpened,
    homePositionShift,
    currentPersonaId,
    currentGroups,
} from '@store/store.ts'
import Btn from '../../../package/mock-components/Btn'
import DialogModal from '../../../package/mock-components/DialogModal'
import LargeCrossShape from '../../../package/mock-components/shapes/LargeCrossShape'
import TrashShape from '../../../package/mock-components/shapes/TrashShape'
import PersonaDetailEditor from '@components/PersonaDetailEditor'
import BalloonShape from '@components/shapes/BalloonShape'
import type { CreatePersonaDto, PersonaTypes } from '../types/Persona.types.ts'
import { useCrossFadeOutSetting } from '../../../package/hooks/useCrossFadeOutSetting.ts'
import { getPersonaById, updatePersona } from 'src/server/database/persona.ts'
import { Trans, useTranslation } from 'react-i18next'
import { createSearchHistory } from 'src/server/database/searchHistory.ts'
import { listGroups } from 'src/server/database/group.ts'
import { EXTRACT_NAME_DESC_PROMPT } from 'src/static/prompt.ts'
import { jsonAnswer } from 'src/server/utils/chatApi.ts'

interface PersonaDetailProps {
    onDuplicate: (
        persona: CreatePersonaDto,
        group_name?: string
    ) => Promise<void>
    onDelete: (id: number) => Promise<void>
    fetch: () => Promise<void>
    handleGroupSelection: (group_name: string) => Promise<number | null>
}

const PersonaDetail = ({
    onDuplicate,
    onDelete,
    fetch,
    handleGroupSelection,
}: PersonaDetailProps) => {
    const abortControllerRef = useRef<AbortController | null>(null)
    const { t } = useTranslation()
    const personaDetailRef = useRef<HTMLDivElement>(null)
    const [isEdit, setIsEdit] = useState(false)
    const [isDuplicate, setIsDuplicate] = useState(false)

    const [isGenerating, setIsGenerating] = useState(false)

    const [isCloseConfirmModalOpened, setIsCloseConfirmModalOpened] =
        useState(false)
    const [isRemoveConfirmModalOpened, setIsRemoveConfirmModalOpened] =
        useState(false)
    const isPersonaDetailOpened = useStore(personaDetailOpened)
    const personaId = useStore(currentPersonaId)
    // const initialValue: PersonaTypes | undefined = personaList.find(
    //     (persona) => persona.id === currentPersonaId.get()
    // )
    const [value, setValue] = useState<PersonaTypes | null>(null) // 表示中の値
    const [draft, setDraft] = useState<PersonaTypes | null>(null) // ドラフトの値
    const [groupName, setGroupName] = useState<string | null>(null)

    const fetchPersona = useCallback(
        async (id: number) => {
            const initialValue = await getPersonaById(id)
            if (initialValue) {
                setValue(initialValue)
                setDraft(initialValue)
            }
        },
        [personaId]
    )

    useEffect(() => {
        if (!personaId) {
            return
        }

        fetchPersona(personaId)
    }, [personaId, isPersonaDetailOpened])

    const onBeforeClose = () => {
        useCrossFadeOutSetting(personaDetailRef, homePositionShift)
    }

    const onClose = async () => {
        setDraft(null)
        setIsEdit(false)
        setIsDuplicate(false)
        setIsCloseConfirmModalOpened(false)
        setIsRemoveConfirmModalOpened(false)
        personaDetailOpened.set(!personaDetailOpened)
        await fetch()
    }

    const { isCloseAnimating, handleClose, handleAnimationEnd } =
        useAnimationClose(onBeforeClose, onClose)

    const handleOnClose = () => {
        // 編集中の場合は確認のダイアログを表示
        // Abort ongoing requests if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        if (isEdit) {
            setIsCloseConfirmModalOpened(true)
            return
        }
        handleClose()
        homeOpened.set(true)
        bottomAppBarOpened.set(true)
    }

    const handleGroupUpdate = async (groupId: number) => {
        if (groupId && groupName && groupName?.trim() !== '')
            await createSearchHistory(groupName)
        if (groupId) {
            const groups = await listGroups()
            currentGroups.set(groups)
        }
    }

    /**
     * 編集画面
     */
    const handleEditConfirm = async () => {
        let dname = draft?.name
        let ddescription = draft?.other_description
        if (draft) {
            if (value?.profile_description !== draft?.profile_description) {
                const personal_info_extract_prompt = `${EXTRACT_NAME_DESC_PROMPT}\n${draft?.profile_description}`
                await jsonAnswer(personal_info_extract_prompt).then((res) => {
                    const { name, description } = JSON.parse(res)
                    dname = name
                    ddescription = description
                })
            }
        }
        setIsEdit(false)
        setValue(draft)
        let groupId: number | null = null
        if (draft) {
            if (groupName) groupId = await handleGroupSelection(groupName)
            draft.group_id = groupId
            draft.name = dname ?? ''
            draft.other_description = ddescription ?? ''
            await updatePersona(draft.id, draft)
            await fetchPersona(draft.id)
            if (groupId) await handleGroupUpdate(groupId)
        }
    }

    const handleEditCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        setIsEdit(false)
        setDraft(value) //ドラフトを保存済みの内容にリセットする
    }

    /**
     * 複製画面
     */
    const handleDuplicateConfirm = async () => {
        setIsDuplicate(false)
        if (draft) {
            const { id, ...rest } = draft
            await onDuplicate(rest, groupName ?? undefined)
        }
        handleOnClose()
    }

    const handleDuplicateCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        setIsDuplicate(false)
        setDraft(value) //ドラフトを保存済みの内容にリセットする
    }

    /**
     * ペルソナ削除ボタン
     */
    const handleDelete = () => {
        if (value) {
            onDelete(value.id)
            handleOnClose()
        }
    }

    /**
     * トークするボタン
     */
    const personaTalkOpen = () => {
        handleClose()
        personaTalkOpened.set(true)
    }

    return (
        <div>
            {isPersonaDetailOpened && (
                <div
                    ref={personaDetailRef}
                    className={`PersonaDetail ${isCloseAnimating ? 'PersonaDetail--close' : 'PersonaDetail--open'}`}
                    onAnimationEnd={handleAnimationEnd}
                >
                    <div className="editor">
                        <PersonaDetailEditor
                            isEdit={isEdit}
                            isDuplicate={isDuplicate}
                            value={value}
                            draft={draft}
                            setDraft={(newDraft) =>
                                setDraft(newDraft as PersonaTypes | null)
                            }
                            setGroupName={setGroupName}
                            abortControllerRef={abortControllerRef}
                            setImageIsGenerating={setIsGenerating}
                        />
                    </div>
                    <div
                        className={`BottomNavigation ${isEdit ? 'BottomNavigation--edit' : ''} ${isDuplicate ? 'BottomNavigation--duplicate' : ''}`}
                    >
                        <div className="navigation">
                            <div
                                className={`group group--talk ${!isEdit && !isDuplicate ? 'group--show' : 'group--hide'}`}
                            >
                                <Btn
                                    label={t('personaDetail.chat')}
                                    icon={<BalloonShape />}
                                    color="primary"
                                    onClick={personaTalkOpen}
                                    disabled={isEdit}
                                />
                            </div>
                            {/* <div
                                className={`group ${!isEdit && !isDuplicate ? 'group--show' : 'group--hide'}`}
                            >
                                <Btn
                                    size="sm"
                                    label={t('personaDetail.edit')}
                                    color="secondly"
                                    border="gray"
                                    onClick={() => setIsEdit(true)}
                                />
                                <Btn
                                    size="sm"
                                    label={t('personaDetail.duplicate')}
                                    color="secondly"
                                    border="gray"
                                    onClick={() => {
                                        if (draft) {
                                            setDraft({
                                                ...draft,
                                                name: `${draft.name}_copy`,
                                            })
                                        }
                                        setIsDuplicate(true)
                                    }}
                                />
                                <Btn
                                    size="sm-icon"
                                    label=""
                                    color="secondly"
                                    icon={<TrashShape />}
                                    border="gray"
                                    onClick={() =>
                                        setIsRemoveConfirmModalOpened(true)
                                    }
                                />
                            </div>
                            <div
                                className={`group group--edit ${isEdit ? 'group--show' : 'group--hide'}`}
                            >
                                <Btn
                                    size="sm"
                                    label={t('personaDetail.editMode.back')}
                                    color="secondly"
                                    border="none"
                                    onClick={handleEditCancel}
                                />
                                <Btn
                                    size="sm"
                                    label={t('personaDetail.editMode.confirm')}
                                    color="quaternary"
                                    disabled={isGenerating}
                                    border="none"
                                    onClick={async () => {
                                        await handleEditConfirm()
                                    }}
                                />
                            </div>
                            <div
                                className={`group group--duplicate ${isDuplicate ? 'group--show' : 'group--hide'}`}
                            >
                                <Btn
                                    size="sm"
                                    label={t(
                                        'personaDetail.duplicateMode.back'
                                    )}
                                    color="secondly"
                                    border="none"
                                    onClick={handleDuplicateCancel}
                                />
                                <Btn
                                    size="sm"
                                    label={t(
                                        'personaDetail.duplicateMode.save'
                                    )}
                                    disabled={isGenerating}
                                    color="quaternary"
                                    border="none"
                                    onClick={handleDuplicateConfirm}
                                />
                            </div> */}
                        </div>
                    </div>

                    <button className="IconBtn close" onClick={handleOnClose}>
                        <LargeCrossShape />
                    </button>

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

                    {
                        // 削除時のダイアログ
                        isRemoveConfirmModalOpened && (
                            <DialogModal
                                label={
                                    <div>
                                        {t(
                                            'personaDetail.removeConfirmModal.title'
                                        )}
                                    </div>
                                }
                                message={
                                    <p>
                                        <Trans
                                            i18nKey={
                                                'personaDetail.removeConfirmModal.text'
                                            }
                                        />
                                    </p>
                                }
                                control={(handleDialogModalClose) => (
                                    <div className="buttons">
                                        <Btn
                                            label={t(
                                                'personaDetail.removeConfirmModal.no'
                                            )}
                                            border="gray"
                                            onClick={handleDialogModalClose}
                                        />
                                        <Btn
                                            label={t(
                                                'personaDetail.removeConfirmModal.confirm'
                                            )}
                                            onClick={handleDelete}
                                        />
                                    </div>
                                )}
                                onModalClose={() =>
                                    setIsRemoveConfirmModalOpened(false)
                                }
                            />
                        )
                    }
                </div>
            )}
        </div>
    )
}

export default PersonaDetail
