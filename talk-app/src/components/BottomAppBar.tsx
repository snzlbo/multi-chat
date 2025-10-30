import { useStore } from '@nanostores/react'
import {
    bottomAppBarOpened,
    homeOpened,
    homePositionShift,
    homeScrollingPosition,
    personaRegisterOpened,
    multipleSelectMode,
    selectedPersonaIds,
    currentGroups,
} from '@store/store.ts'
import Btn from '../../../package/mock-components/Btn'
import PersonShape from '@components/shapes/PersonShape'
import DownloadShape from '../../../package/mock-components/shapes/DownloadShape'
import MultiPersonaShape from '@components/shapes/MultiPersonaShape'
import { useEffect, useState } from 'react'
import DialogModal from '../../../package/mock-components/DialogModal'
import SuggestForm from '@components/ui/SuggestForm'
import PersonaImportModal from '@components/modals/PersonaImportModal'
import { exportPersonas } from 'src/server/database/logic.ts'
import { Trans, useTranslation } from 'react-i18next'

interface BottomAppBarProps {
    deletePersona: (personas: number[]) => void
    updatePersonaGroup: (
        updatingPersonas: number[],
        group_name: string | null
    ) => Promise<void>
    fetch: () => Promise<void>
}

const BottomAppBar = ({
    deletePersona,
    updatePersonaGroup,
    fetch,
}: BottomAppBarProps) => {
    const { t } = useTranslation()
    const groups = useStore(currentGroups)
    const [isPersonaImportModalOpened, setIsPersonaImportModalOpened] =
        useState(false)
    const [isPersonaExportModalOpened, setIsPersonaExportModalOpened] =
        useState(false)
    const [isGroupSettingModalOpened, setIsGroupSettingModalOpened] =
        useState(false)
    const [newGroup, setNewGroup] = useState<string | null>(null)
    const [newGroupName, setNewGroupName] = useState<string | null>(null)
    const [isGroupExists, setIsGroupExists] = useState(false)
    const [isPersonaDeleteModalOpened, setIsPersonaDeleteModalOpened] =
        useState(false)
    const [isGroupDeleteModalOpened, setIsGroupDeleteModalOpened] =
        useState(false)
    const isBottomAppBarOpened = useStore(bottomAppBarOpened)
    const isMultipleSelectMode = useStore(multipleSelectMode)
    const currentSelectedPersonaIds = useStore(selectedPersonaIds)

    useEffect(() => {
        //複数選択モード解除時にselectedPersonaIdsを空にする
        if (!multipleSelectMode.get()) {
            selectedPersonaIds.set([])
        }
    }, [multipleSelectMode.get()])

    const personaRegisterOpen = () => {
        //設定画面を閉じて一覧画面を戻ってきたときにスクロール位置を調整するために現在のスクロール位置を取得。
        homeScrollingPosition.set(window.scrollY)
        homePositionShift.set(homeScrollingPosition.get())
        personaRegisterOpened.set(true)
        bottomAppBarOpened.set(false)
        homeOpened.set(false)
    }

    const handleDeletePersona = async (personas: number[]) => {
        deletePersona(personas)
        multipleSelectMode.set(false)
    }

    const handleUpdatePersonaGroup = async (
        personas: number[],
        group: string | null
    ) => {
        await updatePersonaGroup(personas, group)
        await fetch()
        multipleSelectMode.set(false)
    }

    return (
        <div>
            <div
                className={`BottomAppBar ${!isBottomAppBarOpened ? 'BottomAppBar--close' : 'BottomAppBar--open'}`}
            >
                <div
                    className={`content ${!isMultipleSelectMode ? 'content--open' : 'content--close'}`}
                >
                    <Btn
                        label={t('personaRegister.label')}
                        icon={<PersonShape />}
                        onClick={personaRegisterOpen}
                    />
                    <div className="left">
                        <Btn
                            color="tertiary"
                            label={t('personaImport.label')}
                            icon={<DownloadShape />}
                            onClick={() => setIsPersonaImportModalOpened(true)}
                        />
                    </div>
                </div>

                <div
                    className={`content content--multiple ${isMultipleSelectMode ? 'content--open' : 'content--close'}`}
                >
                    <Btn
                        label={t('multipleSelect.exportPersona.label')}
                        icon={<DownloadShape />}
                        onClick={() => setIsPersonaExportModalOpened(true)}
                        disabled={currentSelectedPersonaIds.length === 0}
                    />
                    <Btn
                        label={t('multipleSelect.setGroup.label')}
                        icon={<MultiPersonaShape />}
                        onClick={() => setIsGroupSettingModalOpened(true)}
                        disabled={currentSelectedPersonaIds.length === 0}
                    />
                    <Btn
                        label={t('multipleSelect.deletePersona.label')}
                        color="secondly"
                        onClick={() => setIsPersonaDeleteModalOpened(true)}
                        disabled={currentSelectedPersonaIds.length === 0}
                    />
                </div>
            </div>

            {/* <PersonaImportModal
                isOpened={isPersonaImportModalOpened}
                setIsOpened={setIsPersonaImportModalOpened}
                fetch={fetch}
            /> */}

            {/* 以下、モーダル要素 */}

            {/* {isPersonaExportModalOpened && (
                <DialogModal
                    label={<div>{t('multipleSelect.exportPersona.label')}</div>}
                    message={
                        <div className="ModalProps--messageWithNotes">
                            <p>
                                <Trans
                                    i18nKey={t(
                                        'multipleSelect.exportPersona.message'
                                    )}
                                    values={{
                                        n: selectedPersonaIds.get().length,
                                    }}
                                />
                            </p>
                            <p className="notes">
                                <Trans
                                    i18nKey={t(
                                        'multipleSelect.exportPersona.notes'
                                    )}
                                    values={{
                                        n: selectedPersonaIds.get().length,
                                    }}
                                />
                            </p>
                        </div>
                    }
                    control={(onModalClose) => (
                        <div className="buttons">
                            <Btn
                                label={t('multipleSelect.common.cancel')}
                                color="gray"
                                onClick={onModalClose}
                            />
                            <Btn
                                label={t('multipleSelect.exportPersona.export')}
                                onClick={async () => {
                                    const file = await exportPersonas(
                                        selectedPersonaIds.get()
                                    )
                                    const url = URL.createObjectURL(file)
                                    const a = document.createElement('a')
                                    const now = new Date()
                                    const formattedDate =
                                        new Intl.DateTimeFormat('ja-JP', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false,
                                            timeZone: 'Asia/Tokyo',
                                        })
                                            .format(now)
                                            .replace(/\//g, '-')
                                            .replace(/, /g, '_')
                                            .replace(/:/g, '-')
                                    a.href = url
                                    a.download = `Personadata_${formattedDate}.json`
                                    a.click()
                                    URL.revokeObjectURL(url)
                                    onModalClose()
                                }}
                            />
                        </div>
                    )}
                    onModalClose={() => setIsPersonaExportModalOpened(false)}
                />
            )} */}

            {isGroupSettingModalOpened && (
                <DialogModal
                    label={<div>{t('multipleSelect.setGroup.label')}</div>}
                    message={
                        <div className="ModalProps--messageWithNotes">
                            <SuggestForm
                                onChange={(value) => {
                                    setNewGroupName(
                                        value === 'Therapists' ? null : value
                                    )
                                    setNewGroup(value)
                                    const exist = groups
                                        .map((groups) => groups.name)
                                        .some((group) => group === value)
                                    setIsGroupExists(exist)
                                }}
                                onFocus={() => {}}
                                suggestWords={groups.map(
                                    (groups) => groups.name
                                )}
                            />
                        </div>
                    }
                    control={(onModalClose) => (
                        <div className="buttons">
                            <Btn
                                label={
                                    isGroupExists
                                        ? t(
                                              'multipleSelect.setGroup.moveToGroup'
                                          )
                                        : t(
                                              'multipleSelect.setGroup.createNewGroup'
                                          )
                                }
                                onClick={() => {
                                    handleUpdatePersonaGroup(
                                        selectedPersonaIds.get(),
                                        newGroupName
                                    )
                                    onModalClose()
                                }}
                                disabled={!newGroup}
                            />
                        </div>
                    )}
                    onModalClose={() => setIsGroupSettingModalOpened(false)}
                />
            )}

            {isPersonaDeleteModalOpened && (
                <DialogModal
                    label={<div>{t('multipleSelect.deletePersona.title')}</div>}
                    message={
                        <div className="ModalProps--messageWithNotes">
                            <p>
                                <Trans
                                    i18nKey={t(
                                        'multipleSelect.deletePersona.message'
                                    )}
                                    values={{
                                        n: selectedPersonaIds.get().length,
                                    }}
                                />
                            </p>
                            <p className="notes">
                                {t('multipleSelect.deletePersona.notes')}
                            </p>
                        </div>
                    }
                    control={(onModalClose) => (
                        <div className="buttons">
                            <Btn
                                label={t('multipleSelect.common.cancel')}
                                color="gray"
                                onClick={onModalClose}
                            />
                            <Btn
                                label={t('multipleSelect.deletePersona.label')}
                                onClick={() => {
                                    handleDeletePersona(
                                        selectedPersonaIds.get()
                                    )
                                    onModalClose()
                                }}
                            />
                        </div>
                    )}
                    onModalClose={() => setIsPersonaDeleteModalOpened(false)}
                />
            )}
        </div>
    )
}

export default BottomAppBar
