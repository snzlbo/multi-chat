import { useMemo } from 'react'
import type { CreatePersonaDto, PersonaTypes } from '../types/Persona.types.ts'
import LoadingDotShape from 'talk-app/src/components/shapes/LoadingDotsShape'
import PenShape from '@components/shapes/PenShape'
import AutoResizingTextarea from '../../../package/mock-components/AutoResizingTextarea'
import PersonaPlaceholder from '@assets/images/persona-placeholder.webp'
import SuggestForm from './ui/SuggestForm.tsx'
import { useTranslation } from 'react-i18next'
import { currentGroups } from '@store/store.ts'
import { useStore } from '@nanostores/react'

interface PersonaProfileProps {
    isEdit: boolean
    isDuplicate: boolean
    isGenerating?: boolean
    value?: PersonaTypes | null
    draft?: CreatePersonaDto | null
    setGroupName?: (value: string | null) => void
    setDraft: (draft: CreatePersonaDto | PersonaTypes) => void
    onClickUpdateImage: () => void
}

const PersonaProfile = ({
    isEdit,
    isDuplicate,
    isGenerating = false,
    value,
    draft,
    setDraft,
    setGroupName,
    onClickUpdateImage,
}: PersonaProfileProps) => {
    const { t } = useTranslation()
    const groups = useStore(currentGroups)

    const currentGroupName = useMemo(() => {
        if (value) {
            const group = groups.find((group) => group.id === value.group_id)
            return group ? group.name : 'グループが見つかりません'
        }
        return 'グループが見つかりません'
    }, [value, groups])

    return (
        <div className="PersonaProfile">
            <div className="grid gap-5">
                {draft && !isGenerating ? (
                    isEdit || isDuplicate ? (
                        <div className="image">
                            <img
                                loading="lazy"
                                src={
                                    draft?.thumb_file &&
                                    URL.createObjectURL(draft.thumb_file)
                                }
                                width={960}
                                height={960}
                                alt=""
                            />
                            <button
                                className="update--image update"
                                onClick={onClickUpdateImage}
                            >
                                <PenShape />
                            </button>
                        </div>
                    ) : (
                        <div className="image">
                            <img
                                loading="lazy"
                                src={
                                    value?.thumb_file &&
                                    URL.createObjectURL(value.thumb_file)
                                }
                                width={960}
                                height={960}
                                alt=""
                            />
                        </div>
                    )
                ) : (
                    <div
                        className={`image ${isGenerating ? 'image--generating' : ''}`}
                    >
                        <img
                            loading="lazy"
                            src={PersonaPlaceholder.src}
                            width={PersonaPlaceholder.width}
                            height={PersonaPlaceholder.height}
                            alt=""
                        />
                        <div className="dot">
                            <LoadingDotShape />
                        </div>
                    </div>
                )}
                {draft ? (
                    isEdit || isDuplicate ? (
                        <div className="grid gap-3">
                            <div className="update text-sm">
                                <input
                                    type="text"
                                    value={draft?.name}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="update">
                                <AutoResizingTextarea
                                    value={draft?.other_description}
                                    onChange={(e) =>
                                        setDraft({
                                            ...draft,
                                            other_description: e.target.value,
                                        })
                                    }
                                    minHeight={73}
                                    maxHeight={222}
                                    singleLine={false}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            <div className="text-sm">{value?.name}</div>
                            <div>{value?.other_description}</div>
                        </div>
                    )
                ) : (
                    <div
                        className={`grid gap-6 ${isGenerating ? 'generating--wave' : ''}`}
                    >
                        <div className="grid gap-[18px] text-sm">
                            <div className="blinking-skeleton h-[1em]"></div>
                            <div className="blinking-skeleton h-[1em] w-[40%]"></div>
                        </div>
                        <div className="grid gap-[18px] text-sm">
                            <div className="blinking-skeleton h-[1em]"></div>
                            <div className="blinking-skeleton h-[1em] w-[40%]"></div>
                        </div>
                    </div>
                )}

                {draft &&
                    (isEdit || isDuplicate ? (
                        <div className="group">
                            <div className="text-grayscale-600">
                                {t('persona.group.label')}
                            </div>
                            <div className="ModalProps--messageWithNotes">
                                <SuggestForm
                                    onChange={(value) => {
                                        if (setGroupName) {
                                            setGroupName(
                                                value === 'Therapists'
                                                    ? null
                                                    : value
                                            )
                                        }
                                    }}
                                    role="set-group"
                                    defaultValue={
                                        groups.find(
                                            (group) =>
                                                group.id === draft.group_id
                                        )?.name ?? ''
                                    }
                                    onFocus={() => {}}
                                    suggestWords={groups.map(
                                        (group) => group.name
                                    )}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>{currentGroupName}</div>
                    ))}
            </div>
        </div>
    )
}

export default PersonaProfile
