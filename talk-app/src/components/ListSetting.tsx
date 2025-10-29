import { multipleSelectMode, groupFilterWord, sortOrder } from '@store/store.ts'
import Btn from '../../../package/mock-components/Btn'
import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'
import SuggestForm from '@components/ui/SuggestForm.tsx'
import type { PersonaGroupTypes } from '../types/Persona.types.ts'
import { useTranslation } from 'react-i18next'

interface ListSettingProps {
    personaGroups: PersonaGroupTypes[]
}

const ListSetting = ({ personaGroups }: ListSettingProps) => {
    const { t, i18n } = useTranslation()
    const [currentSortOrderLabel, setCurrentSortOrderLabel] = useState('')
    const isMultipleSelectMode = useStore(multipleSelectMode)
    const currentSortOrder = useStore(sortOrder)
    const groupNameList: (string | undefined)[] = personaGroups.map(
        (group) => group.name
    )
    const NormalizedGroupNameList: string[] = groupNameList.filter(
        (groupName) => groupName !== undefined
    )

    useEffect(() => {
        setCurrentSortOrderLabel(t('listSetting.group.setting.sort.label'))
    }, [i18n.language])

    // ソート機能
    const toggleSortOrder = () => {
        sortOrder.set(currentSortOrder === 'DESC' ? 'ASC' : 'DESC')
        setCurrentSortOrderLabel(
            sortOrder.get() === 'ASC'
                ? `${t('listSetting.group.setting.sort.label')}：${t('listSetting.group.setting.sort.asc')}`
                : `${t('listSetting.group.setting.sort.label')}：${t('listSetting.group.setting.sort.desc')}`
        )
    }

    return (
        <div className="ListSettings">
            {!isMultipleSelectMode && (
                <div className="group">
                    <div className="text-[13px]">
                        {t('listSetting.group.label')}
                    </div>
                    <div className="functions">
                        <div className="group-filter">
                            <SuggestForm
                                onChange={(value) => {
                                    groupFilterWord.set(value)
                                }}
                                suggestWords={NormalizedGroupNameList}
                                role="filter-group"
                            />
                        </div>
                        <Btn
                            size="sm-icon"
                            color="secondly"
                            label={currentSortOrderLabel}
                            onClick={toggleSortOrder}
                        />
                    </div>
                </div>
            )}

            <div className="group">
                <div className="text-[13px]">
                    {t('listSetting.persona.label')}
                </div>
                <div className="functions">
                    {isMultipleSelectMode ? (
                        <Btn
                            size="sm-icon"
                            color="primary"
                            label={t(
                                'listSetting.persona.setting.multipleSelect.exit'
                            )}
                            onClick={() => multipleSelectMode.set(false)}
                        />
                    ) : (
                        <Btn
                            size="sm-icon"
                            color="secondly"
                            label={t(
                                'listSetting.persona.setting.multipleSelect.label'
                            )}
                            onClick={() => multipleSelectMode.set(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ListSetting
