import type { ExpertMode } from '../types/Expert.types.ts'
import type { Chatlog } from '../types/Chatlog.types.ts'
import { atom } from 'nanostores'
import type { Group } from 'src/types/Group.types.ts'

export type StoresType = {
    isBackfaceScrollingDisabled?: boolean
    isPersonaDetailOpened?: boolean
    isPersonaTalkOpened?: boolean
    isPersonaRegisterOpened?: boolean
    isBottomAppBarOpened?: boolean
    isHomeOpened?: boolean
    isFaqOpened?: boolean
    isSettingOpened?: boolean
    initialCurrentPersonaId?: string
    isOnboardingOpened?: boolean
    isShowOptionalOnboarding?: boolean
    languageState?: 'fr' | 'en'
    //追加予定
}

export const BackfaceScrollingDisabled = atom<boolean>(false)

export const personaDetailOpened = atom<boolean>(false)

export const personaTalkOpened = atom<boolean>(false)

export const personaRegisterOpened = atom<boolean>(false)

export const bottomAppBarOpened = atom<boolean>(true)

export const homeOpened = atom<boolean>(true)

export const homeScrollingPosition = atom<number>(0)

export const homePositionShift = atom<number>(0)

export const homeCurrentGroupId = atom<number | null>(null)

export const talkStarted = atom<boolean>(false)

export const talkLogChanging = atom<boolean>(false)

export const talkLogRemoving = atom<boolean>(false)

export const talkCtlKeyMode = atom<boolean>(false)

export const faqOpened = atom<boolean>(false)

export const settingOpened = atom<boolean>(false)

export const currentPersonaId = atom<number | null>(null)

export const currentGroups = atom<Group[]>([])

export const multipleSelectMode = atom<boolean>(false)

export const selectedPersonaIds = atom<number[]>([])

export const groupFilterWord = atom<string>('')

export const sortOrder = atom<'ASC' | 'DESC'>('DESC')

export const onboardingOpened = atom<boolean>(false)

export const showOptionalOnboarding = atom<boolean>(false)

export const language = atom<'fr' | 'en'>('en')

export const exportMode = atom<boolean>(false)

export const currentExpertData = atom<ExpertMode | null>(null)

export const selectedTalkLog = atom<Chatlog[] | []>([])

export const currentTalkLogConvoId = atom<string>('')

//追加予定
