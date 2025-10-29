import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import useAnimationClose from 'package/hooks/useAnimationClose'
import {
    bottomAppBarOpened,
    homeOpened,
    homePositionShift,
    settingOpened,
    faqOpened,
    exportMode,
    currentExpertData,
    language,
} from '@store/store.ts'
import Btn from 'package/mock-components/Btn'
import LargeCrossShape from 'package/mock-components/shapes/LargeCrossShape'
import Select from 'package/mock-components/Select'
import Toggle from 'package/mock-components/Toggle'
import DialogModal from 'package/mock-components/DialogModal'
import { useCrossFadeOutSetting } from 'package/hooks/useCrossFadeOutSetting.ts'
import { Trans, useTranslation } from 'react-i18next'
import { EXPERT_PASSWORD } from 'astro:env/client'
import { updateExpertMode, getExpertMode } from 'src/server/database/expert.ts'
import type { UpdateExpertModeDto } from 'src/types/Expert.types.ts'
import { defaultExpertModeValues } from 'src/types/Expert.types.ts'
import { clearTable } from 'src/server/database/base'
import LargeModal from 'package/mock-components/LargeModal'
import AutoResizingTextarea from 'package/mock-components/AutoResizingTextarea'
import { FLASH_URL, TALK_URL } from 'astro:env/client'
import CautionShape from 'package/mock-components/shapes/CautionShape'

const SettingScreen = ({ fetch }: { fetch: () => Promise<void> }) => {
    const { t, i18n } = useTranslation()
    const settingRef = useRef<HTMLDivElement>(null)
    const expertData = currentExpertData.get()
    const [isExpertModeOnModalOpened, setIsExpertModeOnModalOpened] =
        useState(false)
    const [isExpertModeOffModalOpened, setIsExpertModeOffModalOpened] =
        useState(false)
    const [isConvoPromptModalOpened, setIsConvoPromptModalOpened] =
        useState(false)
    const [isExtractPromptModalOpened, setIsExtractPromptModalOpened] =
        useState(false)
    const [isImageGenModalOpened, setIsImageGenModalOpened] = useState(false)
    const [convoPrompt, setConvoPrompt] = useState(
        expertData?.chat_prompt || ''
    )
    const [extractPrompt, setExtractPrompt] = useState(
        expertData?.gemini_extract_text_prompt || ''
    )
    const [imageGenPrompt, setImageGenPrompt] = useState(
        expertData?.img_gen_prompt || ''
    )
    const [expertModePassword, setExpertModePassword] = useState('')
    const isSettingOpened = useStore(settingOpened)
    const isFaqOpened = useStore(faqOpened)
    const isExpertMode = useStore(exportMode)
    const imageGenModels = {
        'dall-e-3': 'Dall-E 3',
        'imagen-3.0-generate-002': 'Imagen-3',
        'gpt-image-1': 'GPT Image 1',
    }
    const [isDeleteAllModalOpened, setIsDeleteAllModalOpened] = useState(false)
    const [isLogoutModalOpened, setIsLogoutModalOpened] = useState(false)

    useEffect(() => {
        if (expertData) {
            setConvoPrompt(expertData.chat_prompt)
            setExtractPrompt(expertData.gemini_extract_text_prompt)
            setImageGenPrompt(expertData.img_gen_prompt)
        }
    }, [expertData])

    const fetchExpertData = () => {
        getExpertMode().then((data) => {
            currentExpertData.set(data)
        })
    }
    const onBeforeClose = () => {
        useCrossFadeOutSetting(settingRef, homePositionShift)

        if (!faqOpened.get()) {
            homeOpened.set(true)
            bottomAppBarOpened.set(true)
        } else {
            window.scrollTo(0, 0)
        }
    }

    const onClose = () => {
        settingOpened.set(false)
    }

    const toggleExpertMode = (toggle: boolean) => {
        if (toggle) {
            if (expertModePassword === EXPERT_PASSWORD) {
                setIsExpertModeOnModalOpened(false)
                exportMode.set(true)
                handleUpdate({ is_enabled: true } as UpdateExpertModeDto)
                setExpertModePassword('')
            } else {
                alert('パスワードが間違っています。')
            }
        } else {
            setIsExpertModeOffModalOpened(false)
            exportMode.set(false)
            handleUpdate({ ...defaultExpertModeValues } as UpdateExpertModeDto)
        }
    }

    const handleUpdate = (updateItem: UpdateExpertModeDto) => {
        const currentExpertValues = currentExpertData.get()
        const payload = { ...currentExpertValues, ...updateItem }
        updateExpertMode(payload).then(() => {
            fetchExpertData()
        })
    }
    const updateImageGenModel = (newValue: string) => {
        handleUpdate({ img_gen_model: newValue } as UpdateExpertModeDto)
    }

    const handleImageGenPrompt = () => {
        handleUpdate({ img_gen_prompt: imageGenPrompt } as UpdateExpertModeDto)
        setIsImageGenModalOpened(false)
    }

    const handleExtractionPrompt = () => {
        handleUpdate({
            gemini_extract_text_prompt: extractPrompt,
        } as UpdateExpertModeDto)
        setIsExtractPromptModalOpened(false)
    }

    const handleChatPrompt = () => {
        handleUpdate({ chat_prompt: convoPrompt } as UpdateExpertModeDto)
        setIsConvoPromptModalOpened(false)
    }

    const { isCloseAnimating, handleClose, handleAnimationEnd } =
        useAnimationClose(onBeforeClose, onClose)

    const handleFaqOpen = () => {
        faqOpened.set(true)
        handleClose()
    }

    const handleExpertMode = (newValue: boolean) => {
        if (newValue) {
            setIsExpertModeOnModalOpened(true)
        } else {
            setIsExpertModeOffModalOpened(true)
        }
    }

    const logout = () => {
        window.location.href = `${TALK_URL}/_layouts/closeConnection.aspx?loginasanotheruser=true`
    }

    useEffect(() => {
        if (!isExpertModeOnModalOpened) {
            setExpertModePassword('')
        }
    }, [isExpertModeOnModalOpened])

    useEffect(() => {
        if (!isExpertModeOnModalOpened) {
            setExpertModePassword('')
        }
    }, [isExpertModeOnModalOpened])

    return (
        <div>
            {isSettingOpened && (
                <div
                    ref={settingRef}
                    className={`SettingScreen ${isCloseAnimating ? 'SettingScreen--close' : 'SettingScreen--open'} scroll-gutter`}
                    onAnimationEnd={handleAnimationEnd}
                >
                    <div className="inner">
                        <div className="grid gap-16">
                            <div className="grid gap-10">
                                <h2 className="title">{t('setting.title')}</h2>
                                <ul className="TermList">
                                    <li className="item">
                                        <div>{t('setting.language.label')}</div>
                                        <div>
                                            <Select
                                                options={[
                                                    {
                                                        label: t(
                                                            'setting.language.options.fr'
                                                        ),
                                                        value: 'fr',
                                                        onSelect: () => {
                                                            i18n.changeLanguage(
                                                                'fr'
                                                            )
                                                            language.set('fr')
                                                        },
                                                    },
                                                    {
                                                        label: t(
                                                            'setting.language.options.en'
                                                        ),
                                                        value: 'en',
                                                        onSelect: () => {
                                                            i18n.changeLanguage(
                                                                'en'
                                                            )
                                                            language.set('en')
                                                        },
                                                    },
                                                ]}
                                                defaultValue={t(
                                                    `setting.language.options.${i18n.language}`
                                                )}
                                            />
                                        </div>
                                    </li>
                                    {/* <li className="item">
                                        <div>
                                            {t(
                                                'setting.deleteAllPersona.label'
                                            )}
                                        </div>
                                        <div>
                                            <Btn
                                                size="sm"
                                                label={t(
                                                    'setting.deleteAllPersona.button.label'
                                                )}
                                                color="secondly"
                                                border="gray"
                                                onClick={() =>
                                                    setIsDeleteAllModalOpened(
                                                        true
                                                    )
                                                }
                                            />
                                        </div>
                                        {isDeleteAllModalOpened && (
                                            <DialogModal
                                                label={
                                                    <div>
                                                        {t(
                                                            'setting.deleteAllPersona.title'
                                                        )}
                                                    </div>
                                                }
                                                message={
                                                    <p>
                                                        <Trans
                                                            i18nKey={
                                                                'setting.deleteAllPersona.text'
                                                            }
                                                        />
                                                    </p>
                                                }
                                                control={(
                                                    handleDialogModalClose
                                                ) => (
                                                    <div className="buttons">
                                                        <Btn
                                                            label={t(
                                                                'setting.deleteAllPersona.button.no'
                                                            )}
                                                            color="secondly"
                                                            border="gray"
                                                            onClick={
                                                                handleDialogModalClose
                                                            }
                                                        />
                                                        <Btn
                                                            label={t(
                                                                'setting.deleteAllPersona.button.confirm'
                                                            )}
                                                            onClick={async () => {
                                                                await clearTable()
                                                                // TODO refactor
                                                                setTimeout(
                                                                    async () => {
                                                                        await fetch()
                                                                    },
                                                                    100
                                                                )
                                                                handleDialogModalClose()
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                onModalClose={() =>
                                                    setIsDeleteAllModalOpened(
                                                        false
                                                    )
                                                }
                                            />
                                        )}
                                    </li> */}
                                    <li className="item">
                                        <div>{t('setting.faq.label')}</div>
                                        <div>
                                            <Btn
                                                size="sm"
                                                label={t(
                                                    'setting.faq.button.label'
                                                )}
                                                color="secondly"
                                                border="gray"
                                                onClick={() => {}}
                                            />
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            {/* <div className="grid gap-10">
                                <div>
                                    <ul className="TermList TermList--single">
                                        <li className="item item--border-bold-primary">
                                            <div className="grid gap-1">
                                                <div className="text-base font-bold">
                                                    {t(
                                                        'setting.expertMode.label'
                                                    )}
                                                </div>
                                                {!isExpertMode && (
                                                    <p className="text-[13px] leading-[1.6] text-grayscale-600">
                                                        {t(
                                                            'setting.expertMode.notes'
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Toggle
                                                    value={isExpertMode}
                                                    onRequestToggle={
                                                        handleExpertMode
                                                    }
                                                />
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="heading">
                                        {t('setting.personaExtraction.label')}
                                    </h3>
                                    <ul className="TermList">
                                        <li className="item">
                                            <div>
                                                {t(
                                                    'setting.defaultLanguageModel.label'
                                                )}
                                            </div>
                                            <div>
                                                {isExpertMode && (
                                                    <Select
                                                        options={[
                                                            {
                                                                label: 'GPT-4o',
                                                                value: 'gpt-4o',
                                                                onSelect:
                                                                    () => {},
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </div>
                                        </li>
                                        <li className="item">
                                            <div className="grid gap-1">
                                                <p>
                                                    {t(
                                                        'setting.personaExtractionPrompt.label'
                                                    )}
                                                </p>
                                                {!isExpertMode && (
                                                    <p className="text-[13px] leading-[1.6] text-grayscale-600">
                                                        {t(
                                                            'setting.personaExtractionPrompt.notes'
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                {isExpertMode && (
                                                    <Btn
                                                        size="sm"
                                                        onClick={() =>
                                                            setIsExtractPromptModalOpened(
                                                                true
                                                            )
                                                        }
                                                        label={t(
                                                            'setting.common.edit'
                                                        )}
                                                        color="secondly"
                                                        border="gray"
                                                    />
                                                )}
                                            </div>
                                        </li>
                                        <li className="item">
                                            <div className="grid gap-1">
                                                <p>
                                                    {t(
                                                        'setting.globalConversationPrompt.label'
                                                    )}
                                                </p>
                                                {!isExpertMode && (
                                                    <p className="text-[13px] leading-[1.6] text-grayscale-600">
                                                        {t(
                                                            'setting.globalConversationPrompt.notes'
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                {isExpertMode && (
                                                    <Btn
                                                        size="sm"
                                                        onClick={() =>
                                                            setIsConvoPromptModalOpened(
                                                                true
                                                            )
                                                        }
                                                        label={t(
                                                            'setting.common.edit'
                                                        )}
                                                        color="secondly"
                                                        border="gray"
                                                    />
                                                )}
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="heading">
                                        {t('setting.generateImage.label')}
                                    </h3>
                                    <ul className="TermList">
                                        <li className="item">
                                            <div>
                                                {t(
                                                    'setting.defaultImageGenerationModel.label'
                                                )}
                                            </div>
                                            <div>
                                                {isExpertMode && (
                                                    <Select
                                                        defaultValue={
                                                            imageGenModels[
                                                                (expertData?.img_gen_model as keyof typeof imageGenModels) ??
                                                                    'dall-e-3'
                                                            ]
                                                        }
                                                        options={[
                                                            {
                                                                label: imageGenModels[
                                                                    'dall-e-3'
                                                                ],
                                                                value: 'dall-e-3',
                                                                onSelect:
                                                                    () => {
                                                                        updateImageGenModel(
                                                                            'dall-e-3'
                                                                        )
                                                                    },
                                                            },
                                                            {
                                                                label: imageGenModels[
                                                                    'imagen-3.0-generate-002'
                                                                ],
                                                                value: 'imagen-3.0-generate-002',
                                                                onSelect:
                                                                    () => {
                                                                        updateImageGenModel(
                                                                            'imagen-3.0-generate-002'
                                                                        )
                                                                    },
                                                            },
                                                            {
                                                                label: imageGenModels[
                                                                    'gpt-image-1'
                                                                ],
                                                                value: 'gpt-image-1',
                                                                onSelect:
                                                                    () => {
                                                                        updateImageGenModel(
                                                                            'gpt-image-1'
                                                                        )
                                                                    },
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </div>
                                        </li>
                                        <li className="item">
                                            <div className="grid gap-1">
                                                <p>
                                                    {t(
                                                        'setting.profileImageGenerationPrompt.label'
                                                    )}
                                                </p>
                                                {!isExpertMode && (
                                                    <p className="text-[13px] leading-[1.6] text-grayscale-600">
                                                        {t(
                                                            'setting.profileImageGenerationPrompt.notes'
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                {isExpertMode && (
                                                    <Btn
                                                        size="sm"
                                                        onClick={() =>
                                                            setIsImageGenModalOpened(
                                                                true
                                                            )
                                                        }
                                                        label={t(
                                                            'setting.common.edit'
                                                        )}
                                                        color="secondly"
                                                        border="gray"
                                                    />
                                                )}
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h3 className="heading heading--large">
                                    {t('setting.otherLinks.label')}
                                </h3>
                                <ul className="TermList">
                                    <li className="item">
                                        <div className="grid gap-1">
                                            <div>
                                                {t(
                                                    'setting.openAIQQQFLASH.label'
                                                )}
                                            </div>
                                            <p className="text-xs leading-[1.6] text-grayscale-600">
                                                {t(
                                                    'setting.openAIQQQFLASH.notes'
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <Btn
                                                size="sm"
                                                label={t(
                                                    'setting.openAIQQQFLASH.button.label'
                                                )}
                                                color="secondly"
                                                border="gray"
                                                onClick={() => {
                                                    window.open(
                                                        FLASH_URL,
                                                        '_blank'
                                                    )
                                                }}
                                            />
                                        </div>
                                    </li>
                                </ul>
                            </div> */}
                        </div>
                        {/* <div className="flex justify-center mt-[80px]">
                            <Btn
                                size="sm"
                                label={t('setting.logout.button.label')}
                                color="secondly"
                                onClick={() => {
                                    setIsLogoutModalOpened(true)
                                }}
                            />
                        </div>

                        {isLogoutModalOpened && (
                            <DialogModal
                                label={<div>{t('setting.logout.title')}</div>}
                                message={
                                    <div>
                                        <p>{t('setting.logout.text')}</p>
                                    </div>
                                }
                                control={() => (
                                    <div className="buttons">
                                        <Btn
                                            label={t(
                                                'setting.logout.button.no'
                                            )}
                                            color="gray"
                                            onClick={() => {
                                                setIsLogoutModalOpened(false)
                                            }}
                                        />
                                        <Btn
                                            label={t(
                                                'setting.logout.button.confirm'
                                            )}
                                            onClick={() => {
                                                logout()
                                            }}
                                        />
                                    </div>
                                )}
                                onModalClose={() => {
                                    setIsLogoutModalOpened(false)
                                }}
                            />
                        )} */}
                    </div>

                    <button
                        className="IconBtn close"
                        onClick={handleClose}
                        disabled={isFaqOpened}
                    >
                        <LargeCrossShape />
                    </button>
                </div>
            )}

            {/* 以下、モーダル要素 */}

            {isExpertModeOnModalOpened && (
                <DialogModal
                    label={<div>{t('setting.expertModeOnModal.label')}</div>}
                    message={
                        <div className="ModalProps--passwordField">
                            <p>{t('setting.expertModeOnModal.text')}</p>
                            <div>
                                <input
                                    className="TextField"
                                    type="password"
                                    value={expertModePassword}
                                    onChange={(e) => {
                                        setExpertModePassword(e.target.value)
                                    }}
                                />
                            </div>
                            <p className="notes">
                                <Trans
                                    i18nKey={t(
                                        'setting.expertModeOnModal.notes'
                                    )}
                                />
                            </p>
                        </div>
                    }
                    control={(handleDialogModalClose) => (
                        <div>
                            <div className="buttons">
                                <Btn
                                    label={t('setting.common.confirm')}
                                    onClick={() => toggleExpertMode(true)}
                                    disabled={expertModePassword.trim() === ''}
                                />
                            </div>
                        </div>
                    )}
                    onModalClose={() => {
                        setExpertModePassword('')
                        setIsExpertModeOnModalOpened(false)
                    }}
                />
            )}

            {isExpertModeOffModalOpened && (
                <DialogModal
                    label={<div>{t('setting.expertModeOffModal.label')}</div>}
                    message={
                        <p>
                            <Trans
                                i18nKey={t('setting.expertModeOffModal.text')}
                            />
                        </p>
                    }
                    control={(handleDialogModalClose) => (
                        <div>
                            <div className="buttons">
                                <Btn
                                    label={t('setting.common.cancel')}
                                    border="gray"
                                    onClick={handleDialogModalClose}
                                />
                                <Btn
                                    label={t('setting.common.confirm')}
                                    onClick={() => toggleExpertMode(false)}
                                />
                            </div>
                        </div>
                    )}
                    onModalClose={() => setIsExpertModeOffModalOpened(false)}
                />
            )}
            {isConvoPromptModalOpened && (
                <LargeModal
                    title={t('setting.editPrompts.chat.title')}
                    children={(handleLargeModalClose) => (
                        <div>
                            <div className="ModalProps--promptFieldGroup">
                                <div className="ModalProps--promptField">
                                    <AutoResizingTextarea
                                        value={convoPrompt}
                                        onChange={(e) => {
                                            setConvoPrompt(e.target.value)
                                        }}
                                        minHeight={0} //220
                                        maxHeight={3000}
                                        singleLine={false}
                                        modifier={'Textarea'}
                                    />
                                    {convoPrompt !==
                                        defaultExpertModeValues.chat_prompt && (
                                        <div className="reset">
                                            <Btn
                                                size="sm"
                                                label={t(
                                                    'personaTalk.expertSettingModal.revert'
                                                )}
                                                color="secondly"
                                                border="gray"
                                                onClick={() => {
                                                    setConvoPrompt(
                                                        defaultExpertModeValues.chat_prompt
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
                                        {t('common.alert.neverDisclosePrompts')}
                                    </div>
                                </div>
                                <div className="buttons">
                                    <Btn
                                        label={t(
                                            'personaTalk.expertSettingModal.cancel'
                                        )}
                                        color="secondly"
                                        border="gray"
                                        onClick={() => {
                                            setIsConvoPromptModalOpened(false)
                                            setConvoPrompt(
                                                expertData?.chat_prompt ?? ''
                                            )
                                        }}
                                    />
                                    <Btn
                                        label={t(
                                            'personaTalk.expertSettingModal.save'
                                        )}
                                        disabled={
                                            convoPrompt ===
                                            expertData?.chat_prompt
                                        }
                                        onClick={handleChatPrompt}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    onModalClose={() => {
                        setIsConvoPromptModalOpened(false)
                        setConvoPrompt(expertData?.chat_prompt ?? '')
                    }}
                />
            )}
            {isExtractPromptModalOpened && (
                <LargeModal
                    title={t('setting.editPrompts.extract.title')}
                    children={(handleLargeModalClose) => (
                        <div>
                            <div className="ModalProps--promptFieldGroup">
                                <div className="ModalProps--promptField">
                                    <AutoResizingTextarea
                                        value={extractPrompt}
                                        onChange={(e) => {
                                            setExtractPrompt(e.target.value)
                                        }}
                                        minHeight={0} //220
                                        maxHeight={3000}
                                        singleLine={false}
                                        modifier={'Textarea'}
                                    />
                                    {extractPrompt !==
                                        defaultExpertModeValues.gemini_extract_text_prompt && (
                                        <div className="reset">
                                            <Btn
                                                size="sm"
                                                label={t(
                                                    'personaTalk.expertSettingModal.revert'
                                                )}
                                                color="secondly"
                                                border="gray"
                                                onClick={() => {
                                                    setExtractPrompt(
                                                        defaultExpertModeValues.gemini_extract_text_prompt
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
                                        {t('common.alert.neverDisclosePrompts')}
                                    </div>
                                </div>
                                <div className="buttons">
                                    <Btn
                                        label={t(
                                            'personaTalk.expertSettingModal.cancel'
                                        )}
                                        color="secondly"
                                        border="gray"
                                        onClick={() => {
                                            setIsExtractPromptModalOpened(false)
                                            setExtractPrompt(
                                                expertData?.gemini_extract_text_prompt ??
                                                    ''
                                            )
                                        }}
                                    />
                                    <Btn
                                        label={t(
                                            'personaTalk.expertSettingModal.save'
                                        )}
                                        disabled={
                                            extractPrompt ===
                                            expertData?.gemini_extract_text_prompt
                                        }
                                        onClick={handleExtractionPrompt}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    onModalClose={() => {
                        setIsExtractPromptModalOpened(false)
                        setExtractPrompt(
                            expertData?.gemini_extract_text_prompt ?? ''
                        )
                    }}
                />
            )}
            {isImageGenModalOpened && (
                <LargeModal
                    title={t('setting.editPrompts.image.title')}
                    children={(handleLargeModalClose) => (
                        <div>
                            <div className="ModalProps--promptFieldGroup">
                                <div className="ModalProps--promptField">
                                    <AutoResizingTextarea
                                        value={imageGenPrompt}
                                        onChange={(e) => {
                                            setImageGenPrompt(e.target.value)
                                        }}
                                        minHeight={0} //220
                                        maxHeight={3000}
                                        singleLine={false}
                                        modifier={'Textarea'}
                                    />
                                    {imageGenPrompt !==
                                        defaultExpertModeValues.img_gen_prompt && (
                                        <div className="reset">
                                            <Btn
                                                size="sm"
                                                label={t(
                                                    'personaTalk.expertSettingModal.revert'
                                                )}
                                                color="secondly"
                                                border="gray"
                                                onClick={() => {
                                                    setImageGenPrompt(
                                                        defaultExpertModeValues.img_gen_prompt
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
                                        {t('common.alert.neverDisclosePrompts')}
                                    </div>
                                </div>
                                <div className="buttons">
                                    <Btn
                                        label={t(
                                            'personaTalk.expertSettingModal.cancel'
                                        )}
                                        color="secondly"
                                        border="gray"
                                        onClick={() => {
                                            setIsImageGenModalOpened(false)
                                            setImageGenPrompt(
                                                expertData?.img_gen_prompt ?? ''
                                            )
                                        }}
                                    />
                                    <Btn
                                        label={t(
                                            'personaTalk.expertSettingModal.save'
                                        )}
                                        disabled={
                                            imageGenPrompt ===
                                            expertData?.img_gen_prompt
                                        }
                                        onClick={handleImageGenPrompt}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    onModalClose={() => {
                        setIsImageGenModalOpened(false)
                        setImageGenPrompt(expertData?.img_gen_prompt ?? '')
                    }}
                />
            )}
        </div>
    )
}

export default SettingScreen
