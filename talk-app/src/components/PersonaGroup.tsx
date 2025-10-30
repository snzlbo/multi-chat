import { useEffect, useState } from 'react'
import { Flipper, Flipped } from 'react-flip-toolkit'
import { multipleSelectMode } from '@store/store.ts'
import type { PersonaGroupTypes, PersonaTypes } from '../types/Persona.types.ts'
import PersonaCard from '@components/PersonaCard'
import { useStore } from '@nanostores/react'
import { deletePersona } from 'src/server/database/persona.ts'

interface PersonaGroupProps extends PersonaGroupTypes {
    deletingIds: number[]
    creatingIds: number[]
    fetch: (ids: number[] | number) => Promise<void>
}

const PersonaGroup = ({
    id = 'ungrouped',
    name = 'Therapists',
    personaList,
    deletingIds = [],
    creatingIds = [],
    fetch,
}: PersonaGroupProps) => {
    const isMultipleSelectMode = useStore(multipleSelectMode)

    // flipKey をリストの順序や状態に依存する値にすることで、順序変更時にアニメーションが発生する
    const flipKey = personaList
        .map((persona) => `personaData_${persona.id}`)
        .join(',')

    return (
        <section id={String(`group-${id}`)} className="PersonaGroup">
            <div className="grid gap-1">
                <div className="label">Therapists</div>
                <h1
                    className={`group ${isMultipleSelectMode ? 'group--sm' : ''}`}
                >
                    {name}
                </h1>
            </div>
            <Flipper className="" flipKey={flipKey} spring={{ damping: 30 }}>
                <ul className="content">
                    {personaList.map((persona, index) => (
                        <Flipped key={persona.id} flipId={persona.id}>
                            <PersonaCard
                                key={index}
                                {...persona}
                                is_creating={creatingIds.some(
                                    (id) => id === persona.id
                                )}
                                is_deleting={deletingIds.some(
                                    (id) => id === persona.id
                                )}
                                onCreated={async () => {
                                    await fetch(creatingIds)
                                }}
                                onDelete={async () => {
                                    await fetch(deletingIds)
                                }}
                            />
                        </Flipped>
                    ))}
                </ul>
            </Flipper>
        </section>
    )
}

export default PersonaGroup
