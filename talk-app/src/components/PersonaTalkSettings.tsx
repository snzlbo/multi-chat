import React, { useRef, useState } from 'react'
import { talkStarted } from '@store/store.ts'
import { useStore } from '@nanostores/react'
import { useClickOutside } from '../../../package/hooks/useClickOutside.ts'
import { useTranslation } from 'react-i18next'

interface PersonaTalkSettingsProps {
    setIsLogListOpen: (isLogListOpen: boolean) => void
    setIsRemoveConfirmModalOpened: (isRemoveConfirmModalOpened: boolean) => void
    setIsExpertSettingModalOpened: (isExpertSettingModalOpened: boolean) => void
}

const PersonaTalkSettings = ({
    setIsLogListOpen,
    setIsRemoveConfirmModalOpened,
    setIsExpertSettingModalOpened,
}: PersonaTalkSettingsProps) => {
    const { t } = useTranslation()
    const pulldownRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)
    const isTalkStarted = useStore(talkStarted)

    useClickOutside(pulldownRef, isFocused, () => setIsFocused(false))

    const handleDelete = () => {
        setIsFocused(false)
        setIsRemoveConfirmModalOpened(true)
    }

    return (
        <div
            className={`Pulldown ${isFocused ? 'Pulldown--active' : ''}`}
            ref={pulldownRef}
        >
            <button
                className={`btn ${isFocused ? 'btn--active' : ''}`}
                onClick={() => {
                    setIsLogListOpen(true)
                    setIsFocused(false)
                }}
            >
                {t('personaTalk.settings.options.history.label')}
            </button>
        </div>
    )
}

export default PersonaTalkSettings
