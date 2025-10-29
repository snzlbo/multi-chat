import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    BackfaceScrollingDisabled,
    bottomAppBarOpened,
    currentPersonaId,
    homeOpened,
    homePositionShift,
    personaDetailOpened,
    personaTalkOpened,
    talkStarted,
    talkLogRemoving,
    currentTalkLogConvoId,
    currentExpertData,
} from '@store/store.ts'
import { useStore } from '@nanostores/react'
import type { PersonaTypes } from '../types/Persona.types.ts'
import useAnimationClose from '../../../package/hooks/useAnimationClose'
import LargeCrossShape from '../../../package/mock-components/shapes/LargeCrossShape'
import ArrowShape from '../../../package/mock-components/shapes/ArrowShape'
import PersonaTalkApp from '@components/PersonaTalkApp'
import PersonaTalkSettings from '@components/PersonaTalkSettings'
import PersonaTalkLogList from '@components/PersonaTalkLogList'
import Background from '@assets/images/talk-background.webp'
import DialogModal from '../../../package/mock-components/DialogModal'
import Btn from '../../../package/mock-components/Btn'
import LargeModal from '../../../package/mock-components/LargeModal'
import AutoResizingTextarea from '../../../package/mock-components/AutoResizingTextarea'
import { useCrossFadeOutSetting } from '../../../package/hooks/useCrossFadeOutSetting.ts'
import { updatePersona } from 'src/server/database/persona.ts'

import {
    deleteChatLog,
    getChatLogsByConversationId,
} from 'src/server/database/chatlog.ts'
import { Trans, useTranslation } from 'react-i18next'
import CautionShape from '../../../package/mock-components/shapes/CautionShape.tsx'
import { getExpertMode } from 'src/server/database/expert.ts'

interface PersonaTalkProps {
    personaList: PersonaTypes[]
    fetch: () => Promise<void>
}
const PersonaTalk = ({ personaList, fetch }: PersonaTalkProps) => {
    const defaultExpertPrompt = useMemo(() => {
        return currentExpertData.get()?.chat_prompt ?? ''
    }, [currentExpertData.get()])

    const { t } = useTranslation()
    const expertData = useStore(currentExpertData)
    const isPersonaTalkOpened = useStore(personaTalkOpened)
    const personaTalkRef = useRef<HTMLDivElement>(null)
    const [isLogListOpen, setIsLogListOpen] = useState(false)
    const [isRemoveConfirmModalOpened, setIsRemoveConfirmModalOpened] =
        useState(false)
    const [isExpertSettingModalOpened, setIsExpertSettingModalOpened] =
        useState(false)
    const [expertPrompt, setExpertPrompt] = useState(expertData?.chat_prompt)

    const personaData: PersonaTypes | undefined = personaList.find(
        (persona) => persona.id === currentPersonaId.get()
    )

    useEffect(() => {
        if (personaData) {
            setExpertPrompt(personaData?.chat_prompt || defaultExpertPrompt)
        }
    }, [personaData])

    useEffect(() => {
        if (isRemoveConfirmModalOpened) {
            BackfaceScrollingDisabled.set(true)
            return
        }
        BackfaceScrollingDisabled.set(false)
    }, [isRemoveConfirmModalOpened])

    useEffect(() => {
        if (isExpertSettingModalOpened) {
            BackfaceScrollingDisabled.set(true)
            const fetchExpertData = async () => {
                const expertData = await getExpertMode()
                currentExpertData.set(expertData)
            }
            fetchExpertData()
            return
        }
        BackfaceScrollingDisabled.set(false)
    }, [isExpertSettingModalOpened])

    useEffect(() => {
        setExpertPrompt(
            personaData?.chat_prompt ?? expertData?.chat_prompt ?? ''
        )
    }, [expertData])

    const onDeleteCurrentTalklog = () => {
        const convoId = currentTalkLogConvoId.get()
        if (convoId) {
            getChatLogsByConversationId(convoId)
                .then((chatLogs) => {
                    if (chatLogs) {
                        chatLogs.map((log) => {
                            deleteChatLog(log.id)
                        })
                    }
                })
                .finally(() => {
                    setIsRemoveConfirmModalOpened(false)
                })
        } else {
            console.error('convoId is undefined. Update aborted.')
        }
    }

    const onUpdateChatPrompt = () => {
        if (
            personaData &&
            personaData.id !== undefined &&
            expertPrompt !== personaData.chat_prompt
        ) {
            updatePersona(personaData.id, {
                chat_prompt: expertPrompt,
            })
                .then(() => {
                    fetch()
                    setIsExpertSettingModalOpened(false)
                })
                .catch((error) => {
                    console.error('Error updating persona:', error)
                })
        } else {
            console.error('Persona ID is undefined. Update aborted.')
        }
    }

    const onBeforeClose = () => {
        useCrossFadeOutSetting(personaTalkRef, homePositionShift)
    }

    const onClose = () => {
        personaTalkOpened.set(false)
        talkStarted.set(false)
        talkLogRemoving.set(true)
    }

    const { isCloseAnimating, handleClose, handleAnimationEnd } =
        useAnimationClose(onBeforeClose, onClose)

    //閉じるボタンの分岐
    const handleOnClose = (dist: 'home' | 'detail') => {
        handleClose()
        switch (dist) {
            case 'home':
                homeOpened.set(true)
                bottomAppBarOpened.set(true)
                break
            case 'detail':
                personaDetailOpened.set(true)
                break
        }
    }

    return (
        <div>
            {isPersonaTalkOpened && (
                <div>
                    <div
                        ref={personaTalkRef}
                        className={`PersonaTalk ${isCloseAnimating ? 'PersonaTalk--close' : 'PersonaTalk--open'}`}
                        onAnimationEnd={handleAnimationEnd}
                    >
                        <div className={`bg`}>
                            <div className="clip">
                                <img
                                    className={`${isCloseAnimating ? 'bg--close' : 'bg--open'}`}
                                    loading="lazy"
                                    src={Background.src}
                                    width={Background.width}
                                    height={Background.height}
                                    alt=""
                                />
                            </div>
                        </div>

                        <div className="navigation">
                            <button
                                className="back"
                                onClick={() => handleOnClose('detail')}
                            >
                                <span className="arrow">
                                    <span>
                                        <ArrowShape />
                                    </span>
                                    <span className="thumbnail">
                                        <img
                                            loading="lazy"
                                            src={
                                                personaData?.thumb_file &&
                                                URL.createObjectURL(
                                                    personaData.thumb_file
                                                )
                                            }
                                            width={960}
                                            height={960}
                                            alt=""
                                        />
                                    </span>
                                </span>
                                <span className="text">
                                    <span className="name">
                                        {personaData?.name}
                                    </span>
                                    <span className="other">
                                        {personaData?.other_description}
                                    </span>
                                </span>
                            </button>

                            <div className="settings">
                                <PersonaTalkSettings
                                    setIsLogListOpen={setIsLogListOpen}
                                    setIsRemoveConfirmModalOpened={
                                        setIsRemoveConfirmModalOpened
                                    }
                                    setIsExpertSettingModalOpened={
                                        setIsExpertSettingModalOpened
                                    }
                                />
                            </div>

                            <button
                                className="IconBtn"
                                onClick={() => handleOnClose('home')}
                            >
                                <LargeCrossShape />
                            </button>
                        </div>

                        <PersonaTalkApp isCloseAnimating={isCloseAnimating} />
                    </div>

                    <PersonaTalkLogList
                        isLogListOpen={isLogListOpen}
                        setIsLogListOpen={setIsLogListOpen}
                    />

                    {/* 以下、モーダル要素 */}

                    {isRemoveConfirmModalOpened && (
                        <DialogModal
                            label={
                                <div>
                                    {t('personaTalk.removeConfirmModal.title')}
                                </div>
                            }
                            message={
                                <p>
                                    <Trans
                                        i18nKey={
                                            'personaTalk.removeConfirmModal.text'
                                        }
                                    />
                                </p>
                            }
                            control={(handleDialogModalClose) => (
                                <div className="buttons">
                                    <Btn
                                        label={t(
                                            'personaTalk.removeConfirmModal.no'
                                        )}
                                        border="gray"
                                        onClick={handleDialogModalClose}
                                    />
                                    <Btn
                                        label={t(
                                            'personaTalk.removeConfirmModal.confirm'
                                        )}
                                        onClick={() => {
                                            talkLogRemoving.set(true)
                                            onDeleteCurrentTalklog()
                                        }}
                                    />
                                </div>
                            )}
                            onModalClose={() => {
                                setIsRemoveConfirmModalOpened(false)
                            }}
                        />
                    )}

                    {isExpertSettingModalOpened && (
                        <LargeModal
                            title={t('personaTalk.expertSettingModal.title')}
                            children={(handleLargeModalClose) => (
                                <div>
                                    <div className="ModalProps--promptFieldGroup">
                                        <p>
                                            <Trans
                                                i18nKey={
                                                    'personaTalk.expertSettingModal.text'
                                                }
                                            />
                                        </p>
                                        <div className="ModalProps--promptField">
                                            <AutoResizingTextarea
                                                value={expertPrompt}
                                                onChange={(e) => {
                                                    setExpertPrompt(
                                                        e.target.value
                                                    )
                                                }}
                                                minHeight={0} //220
                                                maxHeight={3000}
                                                singleLine={false}
                                                modifier={'Textarea'}
                                            />
                                            {expertPrompt !==
                                                defaultExpertPrompt && (
                                                <div className="reset">
                                                    <Btn
                                                        size="sm"
                                                        label={t(
                                                            'personaTalk.expertSettingModal.revert'
                                                        )}
                                                        border="gray"
                                                        onClick={() => {
                                                            setExpertPrompt(
                                                                defaultExpertPrompt
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="control">
                                        <div className="attention">
                                            <div className="shape">
                                                <CautionShape />
                                            </div>
                                            <div>
                                                {t(
                                                    'common.alert.neverDisclosePrompts'
                                                )}
                                            </div>
                                        </div>
                                        <div className="buttons">
                                            <Btn
                                                label={t(
                                                    'personaTalk.expertSettingModal.cancel'
                                                )}
                                                color="gray"
                                                onClick={() => {
                                                    setExpertPrompt(
                                                        personaData?.chat_prompt ||
                                                            defaultExpertPrompt
                                                    )
                                                    setIsExpertSettingModalOpened(
                                                        false
                                                    )
                                                }}
                                            />
                                            <Btn
                                                disabled={
                                                    expertPrompt ===
                                                    personaData?.chat_prompt
                                                }
                                                label={t(
                                                    'personaTalk.expertSettingModal.save'
                                                )}
                                                onClick={onUpdateChatPrompt}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            onModalClose={() =>
                                setIsExpertSettingModalOpened(false)
                            }
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default PersonaTalk
