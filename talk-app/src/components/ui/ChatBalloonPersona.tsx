import React, { useRef, useEffect } from 'react'
import type { MessageLog } from '../../types/Message.type.ts'
import type { PersonaTypes } from '../../types/Persona.types.ts'
import DummyPersonaImage from '@assets/images/placeholder/person1.webp'
import LoadingDotShape from 'talk-app/src/components/shapes/LoadingDotsShape.tsx'

type ChatBalloonPersonaProps = {
    message: MessageLog
    isGenerating?: boolean
    persona?: PersonaTypes
}

const ChatBalloonPersona: React.FC<ChatBalloonPersonaProps> = ({
    message,
    isGenerating,
    persona,
}) => {
    const balloonRef = useRef<HTMLDivElement>(null)

    // 生成中状態から本文に切り替わる際にアニメーションを実行する
    useEffect(() => {
        if (!isGenerating && balloonRef.current) {
            // アニメーション用のクラスを追加
            balloonRef.current.classList.add('balloon-appear')
            const handleAnimationEnd = () => {
                balloonRef.current?.classList.remove('balloon-appear')
            }
            balloonRef.current.addEventListener(
                'animationend',
                handleAnimationEnd
            )
            return () => {
                balloonRef.current?.removeEventListener(
                    'animationend',
                    handleAnimationEnd
                )
            }
        }
    }, [isGenerating])

    return (
        <div className="chat chat--persona">
            <div className="thumbnail">
                <img
                    loading="lazy"
                    src={
                        persona?.thumb_file instanceof Blob
                            ? URL.createObjectURL(persona.thumb_file)
                            : DummyPersonaImage.src
                    }
                    width={DummyPersonaImage.width}
                    height={DummyPersonaImage.height}
                    alt=""
                />
            </div>
            <div className="balloon">
                <div
                    ref={balloonRef}
                    className={`ChatBalloon ChatBalloon--persona ${message.generating ? 'ChatBalloon--generating' : ''}`}
                >
                    {/* モック用 ダミーの会話本文要素 */}
                    {message.generating && (
                        <div className="dot">
                            <LoadingDotShape />
                        </div>
                    )}
                    {!message.generating && (
                        <div className="prose">
                            {
                                message.content.find(
                                    (item) => item.type === 'text'
                                )?.text
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChatBalloonPersona
