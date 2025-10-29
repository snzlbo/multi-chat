import { useCallback, useEffect, useMemo, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollToPlugin)
import {
    type StoresType,
    BackfaceScrollingDisabled,
    personaDetailOpened,
    personaTalkOpened,
    personaRegisterOpened,
    bottomAppBarOpened,
    homeOpened,
    homeScrollingPosition,
    homePositionShift,
    homeCurrentGroupId,
    faqOpened,
    settingOpened,
    currentPersonaId,
    groupFilterWord,
    multipleSelectMode,
    currentExpertData,
    sortOrder,
    onboardingOpened,
    showOptionalOnboarding,
    language,
    exportMode,
    currentGroups,
} from '@store/store.ts'
import { useStore } from '@nanostores/react'
import type {
    CreatePersonaDto,
    PersonaGroupTypes,
    PersonaTypes,
} from '../types/Persona.types.ts'

import AppBar from '@components/AppBar'
import BottomAppBar from '@components/BottomAppBar'
import ListSetting from '@components/ListSetting'
import PersonaGroup from '@components/PersonaGroup'
import PersonaDetail from '@components/PersonaDetail'
import PersonaTalk from '@components/PersonaTalk'
import PersonaRegister from '@components/PersonaRegister'
import FaqScreen from '@components/FaqScreen'
import SettingScreen from '@components/SettingScreen'
import Onboarding from '@components/Onboarding'
import { useBackfaceScrolling } from '../../../package/hooks/useBackfaceScrolling.ts'
import {
    createGroup,
    deleteGroup,
    listGroups,
    updateGroup,
} from 'src/server/database/group.ts'
import {
    bulkDeletePersonas,
    createPersona,
    deletePersona,
    listPersonas,
    listPersonasByGroup,
    updatePersona,
} from 'src/server/database/persona.ts'
import { getExpertMode } from 'src/server/database/expert.ts'
import type { Group } from '../types/Group.types.ts'
import { createSearchHistory } from 'src/server/database/searchHistory.ts'

import { Trans, useTranslation } from 'react-i18next'
import '../i18n/config.ts'

const App = ({
    isBackfaceScrollingDisabled = false,
    isPersonaDetailOpened = false,
    isPersonaTalkOpened = false,
    isPersonaRegisterOpened = false,
    isBottomAppBarOpened = true,
    isHomeOpened = false,
    isFaqOpened = false,
    isSettingOpened = false,
    isOnboardingOpened = false,
    isShowOptionalOnboarding = true,
    languageState = 'en',
}: StoresType) => {
    const { t, i18n } = useTranslation()
    let hasRunInitialEffect = false
    const groups = useStore(currentGroups)
    const [personaList, setPersonaList] = useState<PersonaTypes[]>([])
    const [personaGroups, setPersonaGroups] = useState<PersonaGroupTypes[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [isGroupUpdating, setIsGroupUpdating] = useState(false)
    const homeOpenedStore = useStore(homeOpened)
    const homePositionShiftStore = useStore(homePositionShift)
    const currentGroupFilterWord = useStore(groupFilterWord)
    const currentSortOrder = useStore(sortOrder)
    const isOnboardingOpenedStore = useStore(onboardingOpened)
    const [deletingIds, setDeletingIds] = useState<number[]>([])
    const [creatingIds, setCreatingIds] = useState<number[]>([])

    const filteredPersonaGroups = personaGroups.filter(
        (group) =>
            // group.name が currentGroupFilterWord と部分一致するもの
            group.name && group.name.indexOf(currentGroupFilterWord) !== -1
    )
    // グループの絞り込み結果が変化したか比較するためのスナップショット
    const [
        currentFilteredPersonaGroupResult,
        setCurrentFilteredPersonaGroupResult,
    ] = useState<(string | undefined)[]>(
        filteredPersonaGroups.map((group) => group.name)
    )
    const [isPersonaGroupWrapperAnimating, setIsPersonaGroupWrapperAnimating] =
        useState(false)

    const getPersonaList = useCallback(async () => {
        const personas = await listPersonas()
        const groupsData = await listGroups()
        const filterGroup = currentGroupFilterWord
            ? groupsData.find((item) => {
                  item.name === currentGroupFilterWord
              })
            : undefined
        const groupedData = await listPersonasByGroup(
            filterGroup?.id,
            sortOrder.get()
        )
        currentGroups.set(groupsData)
        setPersonaList(personas)
        setPersonaGroups(groupedData)
    }, [])

    const fetchData = useCallback(async () => {
        const expertData = await getExpertMode()
        currentExpertData.set(expertData)
        exportMode.set(expertData?.is_enabled ?? false)
        await getPersonaList()
    }, [])

    /**
     * コンポーネントがマウントされた時、モックの初期状態を設定する。
     */
    useEffect(() => {
        if (!hasRunInitialEffect) {
            hasRunInitialEffect = true
            BackfaceScrollingDisabled.set(isBackfaceScrollingDisabled)
            personaDetailOpened.set(isPersonaDetailOpened)
            personaTalkOpened.set(isPersonaTalkOpened)
            personaRegisterOpened.set(isPersonaRegisterOpened)
            bottomAppBarOpened.set(isBottomAppBarOpened)
            homeOpened.set(isHomeOpened)
            faqOpened.set(isFaqOpened)
            settingOpened.set(isSettingOpened)
            currentPersonaId.set(null)
            showOptionalOnboarding.set(isShowOptionalOnboarding)
            language.set(languageState)
            i18n.changeLanguage(languageState)
            onboardingOpened.set(isOnboardingOpened)
            if (languageState === 'en') {
                //setThemeArray(ThemesEn)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        getPersonaList()
    }, [currentSortOrder])

    /**
     * ホーム画面の開閉時の処理
     */
    useEffect(() => {
        if (!homeOpenedStore) {
            multipleSelectMode.set(false)
            window.scrollTo(0, 0)
            return
        }

        //通常は、遷移時に保持した位置にスクロール
        const scrollPosition = homeScrollingPosition.get()
        window.scrollTo(0, scrollPosition)
    }, [homeOpenedStore])

    useEffect(() => {
        //ペルソナを新たに追加した場合は、グループの先頭にスクロール
        const currentGroup = homeCurrentGroupId.get()?.toString() || 'ungrouped'
        if (isCreating && currentGroup) {
            gsap.to(window, {
                duration: 0,
                ease: 'power2.out',
                scrollTo: {
                    y: '#group-' + currentGroup,
                    offsetY: 30,
                },
            })
            setIsCreating(false)
            return
        }
    }, [isCreating])

    useEffect(() => {
        if (isGroupUpdating) {
            DeleteEmptyGroup()
            setIsGroupUpdating(false)
        }
    }, [personaList])

    useEffect(() => {
        // グループの絞り込み結果が変化したかを比較する
        const filteredResult = filteredPersonaGroups.map((group) => group.name)
        // 絞り込み結果が変化していない場合は無視
        if (
            filteredResult.toString() ===
            currentFilteredPersonaGroupResult.toString()
        )
            return
        // 絞り込み結果が変更した場合は新しい値を currentFilteredPersonaGroupResult にセット
        setCurrentFilteredPersonaGroupResult(filteredResult)
        // .PersonaGroupWrapper に CSSのアニメーションを与える
        setIsPersonaGroupWrapperAnimating(true)
    }, [filteredPersonaGroups])

    // const checkPersonaId = (persona: PersonaTypes, keys: number[]) => {
    //     if (persona.id) return keys.includes(persona.id)
    // }

    // const checkGroupId = (group_id: string) => {
    //     // personaList 内に group_id が割り当てられているものがあるかをチェックする。
    //     // 削除アニメーション中（ is_deleting が true のとき ）はまだ personaList 内にオブジェクトとして存在しているが、これも除外する。
    //     const activePersonaList = personaList.filter(
    //         (persona) => !persona.is_deleting
    //     )
    //     const groups = activePersonaList.map((persona) =>
    //         persona.group_id ? persona.group_id : ''
    //     )
    //     const existGroups = groups.filter((group_id, index) => {
    //         return groups.indexOf(group_id) == index
    //     })

    //     return existGroups.includes(group_id)
    // }

    const UpdatePersonaGroup = async (
        updatingPersonas: number[],
        group_name: string | null
    ) => {
        setIsGroupUpdating(true)

        // グループ名が一致するグループが既に存在するかチェック
        let group_id: number | null = null
        if (group_name) {
            const existingGroup = groups.find(
                (group) => group.name === group_name
            )
            if (existingGroup) {
                homeCurrentGroupId.set(existingGroup.id)
            }
            group_id = existingGroup
                ? existingGroup.id
                : await CreateGroup(group_name)
        }
        await Promise.all(
            updatingPersonas.map((persona_id) =>
                updatePersona(persona_id, {
                    group_id,
                })
            )
        )
        await getPersonaList()
        if (group_id && group_name && group_name?.trim() !== '') {
            await createSearchHistory(group_name)
            updateGroup(group_id)
        }

        //移動先のグループにスクロールする
        const currentGroup = homeCurrentGroupId.get()?.toString()
        if (currentGroup) {
            gsap.to(window, {
                duration: 0.6,
                ease: 'power2.out',
                scrollTo: {
                    y: '#group-' + currentGroup,
                    offsetY: 30,
                },
            })
            setIsCreating(false)
            return
        }
    }

    const CreateGroup = async (group_name: string): Promise<number> => {
        try {
            const group_id = await createGroup(group_name)
            await listGroups()
            await createSearchHistory(group_name)
            homeCurrentGroupId.set(group_id)
            return group_id
        } catch (err) {
            console.error(err)
            throw new Error('Failed to create group')
        }
    }
    const DeleteEmptyGroup = () => {
        const emptyGroups = personaGroups.filter(
            (group) => group.personaList.length === 0
        )
        Promise.all(
            emptyGroups.map(async (group) => {
                if (group.id && group.id !== 'ungrouped') {
                    try {
                        await deleteGroup(group.id)
                    } catch (err) {
                        console.error(
                            `Failed to delete group with id ${group.id}:`,
                            err
                        )
                    }
                }
            })
        ).then(async () => {
            getPersonaList()
        })
    }
    const CreatePersona = async (
        persona: CreatePersonaDto,
        group_name?: string
    ) => {
        let groupId = null

        if (group_name) groupId = await handleGroupSelection(group_name)
        if (groupId && group_name && group_name?.trim() !== '')
            await createSearchHistory(group_name)
        persona.group_id = groupId
        homeCurrentGroupId.set(groupId)

        await processPersonaCreation(persona)
    }

    const handleGroupSelection = async (group_name: string) => {
        const groupIndex = personaGroups.findIndex(
            (personaGroup) => personaGroup.name === group_name
        )
        if (groupIndex === -1) {
            await CreateGroup(group_name)
            return homeCurrentGroupId.get()
        }

        return personaGroups[groupIndex].id === 'ungrouped'
            ? null
            : personaGroups[groupIndex].id
    }

    const processPersonaCreation = async (persona: CreatePersonaDto) => {
        setIsCreating(true)
        await createPersona(persona)
        await getPersonaList()
        setIsCreating(false)
    }
    const DeletePersona = async (deletingPersonas: number[] | number) => {
        setIsGroupUpdating(true)

        if (Array.isArray(deletingPersonas)) {
            setDeletingIds((prev) => [...prev, ...deletingPersonas])
            await bulkDeletePersonas(deletingPersonas)
        } else {
            setDeletingIds((prev) => [...prev, deletingPersonas])
            await deletePersona(deletingPersonas)
        }
    }

    /**
     * モーダル展開時などの背景スクロールの禁止／許可切り替え
     */
    useBackfaceScrolling(BackfaceScrollingDisabled)

    return (
        <div>
            <div
                className={`Home ${homeOpenedStore ? 'open' : 'close'}`}
                style={{ top: `${-homePositionShiftStore}px` }}
            >
                <AppBar />
                <div className="grid gap-8 px-7 pt-4 pb-16">
                    <main>
                        <div
                            className={`PersonaGroupWrapper ${isPersonaGroupWrapperAnimating ? 'PersonaGroupWrapper--animating' : ''}`}
                            onAnimationEnd={() =>
                                setIsPersonaGroupWrapperAnimating(false)
                            }
                        >
                            {filteredPersonaGroups.map((group) => (
                                <PersonaGroup
                                    key={group.id}
                                    {...group}
                                    personaList={group.personaList}
                                    deletingIds={deletingIds}
                                    creatingIds={creatingIds}
                                    fetch={async (ids) => {
                                        await getPersonaList()
                                        if (Array.isArray(ids)) {
                                            setDeletingIds((prev) =>
                                                prev.filter(
                                                    (id) => !ids.includes(id)
                                                )
                                            )
                                        } else {
                                            setDeletingIds((prev) =>
                                                prev.filter((id) => id !== ids)
                                            )
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </main>
                </div>
                {/* <BottomAppBar
                    deletePersona={DeletePersona}
                    updatePersonaGroup={UpdatePersonaGroup}
                    fetch={getPersonaList}
                /> */}
            </div>
            <PersonaDetail
                handleGroupSelection={handleGroupSelection}
                onDuplicate={CreatePersona}
                fetch={async () => {
                    setIsGroupUpdating(true)
                    await getPersonaList()
                    setDeletingIds((prev) => prev.filter((id) => id !== id))
                }}
                onDelete={async (id: number) => {
                    await DeletePersona(id)
                }}
            />
            <PersonaTalk personaList={personaList} fetch={getPersonaList} />
            <PersonaRegister onCreate={CreatePersona} />
            <FaqScreen />
            <SettingScreen fetch={getPersonaList} />
            {isOnboardingOpenedStore && <Onboarding />}
        </div>
    )
}

export default App
