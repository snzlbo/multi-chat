import { useRef, useState, useEffect } from 'react'
import {
    talkStarted,
    talkLogChanging,
    talkLogRemoving,
    currentPersonaId,
    selectedTalkLog,
} from '@store/store.ts'
import CrossShape from 'package/mock-components/shapes/CrossShape'
import { useClickOutside } from 'package/hooks/useClickOutside.ts'
import { getChatLogsByPersonaId } from 'src/server/database/chatlog.ts'
import type { Chatlog, ChatlogCreatedAt } from '../types/Chatlog.types.ts'
import { useTranslation } from 'react-i18next'

interface PersonaTalkLogListProps {
    isLogListOpen: boolean
    setIsLogListOpen: (isLogListOpen: boolean) => void
}
const PersonaTalkLogList = ({
    isLogListOpen,
    setIsLogListOpen,
}: PersonaTalkLogListProps) => {
    const { t, i18n } = useTranslation()
    const logListRef = useRef<HTMLDivElement>(null)

    const personaId = currentPersonaId.get()
    const [talkList, setTalkList] = useState<ChatlogCreatedAt>({})

    useEffect(() => {
        if (personaId !== null) {
            getChatLogsByPersonaId(personaId).then((data) => {
                const chatLogs = data as ChatlogCreatedAt
                if (chatLogs) {
                    setTalkList(chatLogs)
                } else {
                    setTalkList({})
                }
            })
        }
    }, [personaId])

    useClickOutside(logListRef, isLogListOpen, () => setIsLogListOpen(false))

    const messagesChange = (sessionLog: Chatlog[]) => {
        talkStarted.set(true)
        setIsLogListOpen(false)
        talkLogChanging.set(true)
        selectedTalkLog.set(sessionLog)
    }

    return (
        <div
            ref={logListRef}
            className={`PersonaTalkLogList ${isLogListOpen ? 'PersonaTalkLogList--open' : 'PersonaTalkLogList--close'}`}
        >
            <div className="container">
                <div className="head">
                    <div className="label">
                        {t('personaTalk.settings.options.history.label')}
                    </div>
                    <button
                        className="IconBtn"
                        onClick={() => {
                            setIsLogListOpen(false)
                        }}
                        onFocus={() => {
                            /* tabキーでアクセスした場合、ドロワーを有効化する */
                            setIsLogListOpen(true)
                        }}
                    >
                        <CrossShape />
                    </button>
                </div>
                <div className="logs">
                    {Object.keys(talkList)
                        .sort()
                        .reverse()
                        .map((createAt: string) => (
                            <div className="log" key={createAt}>
                                <div className="date">
                                    {createAt.replaceAll('-', '.')}
                                </div>
                                <ul className="list">
                                    {Object.keys(talkList[createAt])
                                        .sort()
                                        .reverse()
                                        .map(
                                            (
                                                session: string,
                                                index: number
                                            ) => (
                                                <li
                                                    className="item"
                                                    key={index}
                                                >
                                                    <button
                                                        className="session"
                                                        onClick={() =>
                                                            messagesChange(
                                                                talkList[
                                                                    createAt
                                                                ][session]
                                                            )
                                                        }
                                                        onFocus={() =>
                                                            setIsLogListOpen(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <span className="time">
                                                            {new Date(
                                                                talkList[
                                                                    createAt
                                                                ][
                                                                    session
                                                                ][0].created_at
                                                            ).toLocaleTimeString(
                                                                'en-CA',
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    timeZone:
                                                                        'America/Toronto',
                                                                }
                                                            )}
                                                        </span>
                                                        <span className="title">
                                                            {
                                                                talkList[
                                                                    createAt
                                                                ][session][0]
                                                                    .content
                                                            }
                                                        </span>
                                                    </button>
                                                </li>
                                            )
                                        )}
                                </ul>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

export default PersonaTalkLogList
