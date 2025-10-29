import React, { useRef, useState, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { v4 as uuidv4 } from 'uuid'
import { createChatLog } from 'src/server/database/chatlog.ts'
gsap.registerPlugin(ScrollToPlugin)
import {
    currentPersonaId,
    talkStarted,
    talkLogChanging,
    talkLogRemoving,
    talkCtlKeyMode,
    selectedTalkLog,
    currentTalkLogConvoId,
    language,
    currentExpertData,
} from '@store/store.ts'
import { getPersonaById } from 'src/server/database/persona.ts'
import { useStore } from '@nanostores/react'
import type { MessageLog } from '../types/Message.type.ts'
import type { PersonaTypes } from '../types/Persona.types.ts'
import AutoResizingTextarea from '../../../package/mock-components/AutoResizingTextarea'
import PictureShape from '@components/shapes/PictureShape'
import UpperArrowShape from '@components/shapes/UpperArrowShape'
import ChatBalloonSelf from '@components/ui/ChatBalloonSelf'
import ChatBalloonOther from '@components/ui/ChatBalloonPersona'
import { answer } from 'src/server/utils/chatApi.ts'
import type { Chatlog } from 'src/types/Chatlog.types.ts'
import { useTranslation } from 'react-i18next'
import { defaultExpertModeValues } from 'src/types/Expert.types.ts'
import CrossShape from '../../../package/mock-components/shapes/CrossShape.tsx'

interface PersonaTalkAppProp {
    isCloseAnimating: boolean
}

const PersonaTalkApp = ({ isCloseAnimating }: PersonaTalkAppProp) => {
    const { t } = useTranslation()
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<MessageLog[]>([])
    const [isNewMessageSending, setIsNewMessageSending] = useState(false)
    const [input, setInput] = useState('')
    const [conversationId, setConversationId] = useState('das')
    const [isComposing, setIsComposing] = useState<boolean>(false)
    const isTalkStarted = useStore(talkStarted)
    const isTalkLogChanging = useStore(talkLogChanging)
    const isTalkLogRemoving = useStore(talkLogRemoving)
    const isTalkCtlKeyMode = useStore(talkCtlKeyMode)
    const personaId = currentPersonaId.get()
    const llmLanguage = language.get()
    const expertData = currentExpertData.get()
    const [images, setImages] = useState<File[]>([])
    const [currentPersona, setCurrentPersona] = useState<PersonaTypes>(
        {} as PersonaTypes
    )

    const scrollToBottom = () => {
        if (bottomRef.current) {
            gsap.to(window, {
                duration: 0.6,
                ease: 'power2.out',
                scrollTo: {
                    y: bottomRef.current,
                    offsetY: 64,
                },
            })
        }
    }

    const hasOversizedImage = useMemo(() => {
        const totalSize = images.reduce((acc, file) => acc + file.size, 0)
        return totalSize > 20 * 1024 * 1024
    }, [images])

    useEffect(() => {
        if (!personaId) {
            console.error('Persona ID is not set.')
            return
        }

        getPersonaById(personaId)
            .then((persona) => {
                if (!persona) {
                    console.error(`Persona with ID ${personaId} not found.`)
                    return
                }
                setCurrentPersona(persona)
            })
            .catch((error) => {
                console.error('Error fetching persona:', error)
            })
        setConversationId(uuidv4().slice(0, 7))
    }, [personaId])

    useEffect(() => {
        currentTalkLogConvoId.set(conversationId)
    }, [conversationId])

    const onSend = async () => {
        if (input.trim() === '' || isNewMessageSending) return false
        const inputImage = images
        setInput('')
        talkStarted.set(true)
        setIsNewMessageSending(true)

        const userMessage: MessageLog = {
            conversationId: conversationId,
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: input,
                },
                ...images.map((image) => ({
                    type: 'image_url' as const,
                    image_url: {
                        url: URL.createObjectURL(image),
                    },
                })),
            ],
            generating: false,
        }
        setImages([])

        const botMessage: MessageLog = {
            conversationId: conversationId,
            role: 'assistant',
            content: [
                {
                    type: 'text',
                    text: input,
                },
            ],
            generating: true,
        }
        setMessages([...messages, userMessage, botMessage])

        try {
            const stream = await answer(
                llmLanguage,
                conversationId,
                input,
                Number(personaId),
                inputImage
            )
            let fullResponse = ''

            for await (const chunk of stream) {
                const updatedResponse = fullResponse + chunk
                fullResponse = updatedResponse

                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages]
                    updatedMessages[updatedMessages.length - 1] = {
                        ...updatedMessages[updatedMessages.length - 1],
                        content: [
                            {
                                type: 'text',
                                text: updatedResponse,
                            },
                        ],
                    }
                    return updatedMessages
                })

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        scrollToBottom()
                    })
                })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages]
                createChatLog({
                    persona_id: Number(personaId),
                    conversation_id: conversationId,
                    content: updatedMessages[updatedMessages.length - 1]
                        .content[0].text as string,
                    prompt: '',
                    role: 'assistant',
                    model:
                        expertData?.chat_model ||
                        defaultExpertModeValues.chat_model,
                })
                updatedMessages[updatedMessages.length - 1] = {
                    ...updatedMessages[updatedMessages.length - 1],
                    generating: false,
                }
                return updatedMessages
            })
            setIsNewMessageSending(false)
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                scrollToBottom()
            })
        })
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // CtlまたはCmd+Enterで送信するモードの場合（現在、このモードへの切り替え機能なし）
        if (isTalkCtlKeyMode) {
            if (event.key === 'Enter') {
                // IME変換中なら送信処理をスキップ
                if (isComposing) {
                    return
                }
                if (event.ctrlKey || event.metaKey) {
                    // Cmd（Mac）または Ctrl+Enter で送信
                    event.preventDefault() // 改行防止
                    onSend()
                }
                // Enter 単体の場合は改行挿入（何も防がない）
            }
            return
        }

        // 通常モードの場合
        if (event.key === 'Enter') {
            if (hasOversizedImage) return
            // IME変換中なら送信処理をスキップ
            if (isComposing) {
                return
            }
            if (event.shiftKey) {
                // Shift+Enter: 改行を許可（デフォルト動作）
                return
            } else {
                // Enter 単体: 送信処理
                event.preventDefault() // 改行防止
                onSend()
            }
        }
    }

    const onAnimationEnd = () => {
        //フェードアウト後、talkLogRemoving が true なら messages を初期化
        if (talkLogRemoving.get()) {
            setMessages([])
            talkLogRemoving.set(false)
            talkStarted.set(false)
        }

        //フェードアウト後、talkLogChanging が true なら messages を新しい内容に更新
        if (talkLogChanging.get()) {
            const talksLog = selectedTalkLog.get()
            const parsedTalkLog = talksLog.map((log: Chatlog) => {
                return {
                    conversationId: log.conversation_id,
                    role: log.role,
                    content: [
                        {
                            type: 'text',
                            text: log.content,
                        },
                    ],
                    generating: false,
                } as MessageLog
            })
            setMessages(parsedTalkLog)
            setConversationId(talksLog[0].conversation_id)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    talkLogChanging.set(false)
                    const bottom =
                        document.documentElement.scrollHeight -
                        document.documentElement.clientHeight
                    window.scroll(0, bottom)
                })
            })
        }
    }

    const handleImages = (files: File[]) => {
        if (files && files.length > 0) {
            Array.from(files as File[]).forEach((file: File) => {
                setImages((prevImages) => [...prevImages, file])
            })
        }
    }

    return (
        <div>
            <div
                className={`PersonaTalkLog ${isTalkLogRemoving || isTalkLogChanging ? 'PersonaTalkLog--removing' : ''} ${isNewMessageSending ? 'PersonaTalkLog--new-message-sending' : ''}`}
                onAnimationEnd={onAnimationEnd}
            >
                {messages.map((msg, index) =>
                    msg.role === 'user' ? (
                        <ChatBalloonSelf key={index} contents={msg.content} />
                    ) : (
                        <ChatBalloonOther
                            key={index}
                            message={msg}
                            isGenerating={isNewMessageSending}
                            persona={currentPersona}
                        />
                    )
                )}
                {/* {messages.map((msg, index) =>
                    msg.sender === 'self' ? (
                        <ChatBalloonSelf key={index} content={msg.content} />
                    ) : (
                        <ChatBalloonOther key={index} message={msg} />
                    )
                )} */}
                <div className="PersonaTalkLog-bottom-anchor" ref={bottomRef} />
            </div>

            <div
                className={`PersonaTalkInput ${isTalkStarted ? 'PersonaTalkInput--started' : 'PersonaTalkInput--before-started'} ${isCloseAnimating ? 'PersonaTalkInput--close' : 'PersonaTalkInput--open'}`}
            >
                <div className="clip">
                    <div className="inner">
                        <div
                            className={`label ${isTalkStarted ? 'label--hidden' : ''}`}
                        >
                            {t('personaTalk.input.initialMessage')}
                        </div>

                        {images.length > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    padding: '1rem',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    boxSizing: 'border-box',
                                }}
                                className="input"
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        overflowX: 'auto',
                                        gap: '0.5rem',
                                        paddingBottom: '0.5rem',
                                    }}
                                >
                                    {images.map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                position: 'relative',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                width: '5rem',
                                                height: '5rem',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <button
                                                style={{
                                                    position: 'absolute',
                                                    right: '0.25rem',
                                                    top: '0.25rem',
                                                    zIndex: 20,
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#f0f0f0',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    boxShadow:
                                                        '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                    cursor: 'pointer',
                                                    transition:
                                                        'background-color 0.2s',
                                                }}
                                                className="btn tonal-btn"
                                                onClick={() => {
                                                    setImages((prevImages) => {
                                                        const updatedImages =
                                                            prevImages.filter(
                                                                (_, i) =>
                                                                    i !== index
                                                            )
                                                        return updatedImages
                                                    })
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        '#e0e0e0')
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        '#f0f0f0')
                                                }
                                            >
                                                <CrossShape />
                                            </button>
                                            <figure
                                                style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: '100%',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <img
                                                    src={URL.createObjectURL(
                                                        item
                                                    )}
                                                    alt=""
                                                    style={{
                                                        borderRadius: '4px',
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            </figure>
                                        </div>
                                    ))}
                                </div>

                                {hasOversizedImage && (
                                    <div
                                        style={{
                                            color: '#721c24',
                                            backgroundColor: '#f8d7da',
                                            border: '1px solid #f5c6cb',
                                            borderRadius: '4px',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.875rem',
                                            marginTop: '0.5rem',
                                            width: '100%',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        {t(
                                            'personaTalk.input.imageSizeExceeded'
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div ref={inputRef} className="input">
                            <AutoResizingTextarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e)}
                                onCompositionStart={() => setIsComposing(true)}
                                onCompositionEnd={() => setIsComposing(false)}
                                minHeight={26}
                                maxHeight={156}
                                placeholder={t('personaTalk.input.placeholder')}
                                singleLine={true}
                            />
                            <div className="control">
                                <button
                                    className="btn"
                                    disabled={isNewMessageSending}
                                    onClick={() => {
                                        const fileInput =
                                            document.createElement('input')
                                        fileInput.type = 'file'
                                        fileInput.accept = 'image/*'
                                        fileInput.multiple = true
                                        fileInput.onchange = (event) => {
                                            const files = (
                                                event.target as HTMLInputElement
                                            ).files
                                            if (files) {
                                                handleImages(Array.from(files))
                                            }
                                        }
                                        fileInput.click()
                                    }}
                                >
                                    <PictureShape />
                                </button>
                                <button
                                    className="btn btn--submit"
                                    onClick={onSend}
                                    disabled={
                                        input.trim() === '' ||
                                        isNewMessageSending ||
                                        hasOversizedImage
                                    }
                                >
                                    <UpperArrowShape />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overlay"></div>
        </div>
    )
}

export default PersonaTalkApp
