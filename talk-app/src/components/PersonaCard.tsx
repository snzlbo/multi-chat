import PersonShape from '@components/shapes/PersonShape'
import BalloonShape from '@components/shapes/BalloonShape'
import type { PersonaTypes } from '../types/Persona.types.ts'
import {
    personaDetailOpened,
    personaTalkOpened,
    bottomAppBarOpened,
    homeOpened,
    homeScrollingPosition,
    homePositionShift,
    currentPersonaId,
    multipleSelectMode,
    selectedPersonaIds,
} from '@store/store.ts'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import CheckShape from '@components/shapes/CheckShape'
import { useTranslation } from 'react-i18next'

interface PersonaCardProps extends PersonaTypes {
    is_deleting?: boolean
    is_creating?: boolean
    onDelete: () => Promise<void>
    onCreated: () => Promise<void>
}

const PersonaCard = ({
    id,
    name,
    profile_description,
    other_description,
    original_file,
    thumb_file,
    created_at,
    extraction_prompt,
    format_extraction_prompt,
    chat_prompt,
    status,
    img_gen_prompt,
    group_id,
    is_deleting = false,
    is_creating = false,
    onDelete = async () => {},
    onCreated = async () => {},
    ...flipProps
}: PersonaCardProps) => {
    const { t } = useTranslation()
    const personaCardRef = useRef<HTMLLIElement>(null)
    const [selected, setSelected] = useState(false)
    const isMultipleSelectMode = useStore(multipleSelectMode)

    const personaDetailOpen = (dist: 'detail' | 'talk') => {
        //ペルソナ詳細を閉じて一覧画面を戻ってきたときにスクロール位置を調整するために状態を取得
        //現在のスクロール位置を取得。
        homeScrollingPosition.set(window.scrollY)
        homePositionShift.set(homeScrollingPosition.get())

        switch (dist) {
            case 'detail':
                personaDetailOpened.set(true)
                break
            case 'talk':
                personaTalkOpened.set(true)
                break
        }

        bottomAppBarOpened.set(false)
        homeOpened.set(false)
        currentPersonaId.set(id)
    }

    const handleAnimationEnd = async () => {
        if (is_deleting) {
            await onDelete()
        }
        if (is_creating) {
            await onCreated()
        }
    }

    useEffect(() => {
        // 複数選択モードがオフになったとき、この PersonaCard の selected を解除する
        if (!isMultipleSelectMode) setSelected(false)
    }, [isMultipleSelectMode])

    useEffect(() => {
        if (!id) return
        //チェックしたら selectedPersonaIds にこの PersonaCard の id を追加する
        if (selected) {
            selectedPersonaIds.set([...selectedPersonaIds.get(), id])
        } else {
            const newList = selectedPersonaIds
                .get()
                .filter((prev) => prev !== id)
            selectedPersonaIds.set(newList)
        }
    }, [selected])

    return (
        <li
            ref={personaCardRef}
            className={`PersonaCard ${is_deleting ? 'PersonaCard--deleting' : ''} ${is_creating ? 'PersonaCard--creating' : ''} ${isMultipleSelectMode ? '' : ''}`}
            onAnimationEnd={handleAnimationEnd}
            {...flipProps}
        >
            <div className="image">
                <img
                    loading="lazy"
                    src={thumb_file && URL.createObjectURL(thumb_file)}
                    width="200"
                    height="200"
                    alt=""
                />
            </div>
            <div className="inner">
                <div className="profile">
                    <div className="name">
                        <span>{name}</span>
                    </div>
                    <div className="identity">{other_description}</div>
                </div>
                <div className="navigation">
                    <div className="item pt-3">
                        <button
                            className="btn"
                            onClick={() => personaDetailOpen('detail')}
                        >
                            <span>
                                <PersonShape />
                            </span>
                            <span>{t('persona.persona.details')}</span>
                        </button>
                    </div>
                    <div className="item">
                        <button
                            className="btn"
                            onClick={() => personaDetailOpen('talk')}
                        >
                            <span>
                                <BalloonShape />
                            </span>
                            <span>{t('persona.persona.chat')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {isMultipleSelectMode && (
                <label className="selector">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => setSelected(e.target.checked)}
                    />
                    <div className="marker">
                        <div className="check">
                            <CheckShape />
                        </div>
                    </div>
                </label>
            )}
        </li>
    )
}

export default PersonaCard
