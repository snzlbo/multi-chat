import type { ContentType } from '../../types/Message.type.ts'
import React, { useEffect } from 'react'

type ChatBalloonSelfProps = {
    contents: ContentType[]
}

const ChatBalloonSelf: React.FC<ChatBalloonSelfProps> = ({ contents }) => {
    const splitString = (value: string = '') => {
        return value.split(/(\n)/)
    }

    return (
        <div className="chat chat--self">
            <div className="ChatBalloon ChatBalloon--self">
                <div className="prose">
                    <div style={{ margin: '15px 0' }}>
                        {contents.map((content: ContentType, index: number) => {
                            if (content.type === 'text') {
                                return splitString(content.text).map(
                                    (string: string, index: number) => {
                                        return string.match(/\n/) ? (
                                            <br key={`line-break-${index}`} />
                                        ) : (
                                            <span key={`text-${index}`}>
                                                {string}
                                            </span>
                                        )
                                    }
                                )
                            } else {
                                return (
                                    <div
                                        key={`image-${index}`}
                                        style={{
                                            width: '5rem',
                                            height: '5rem',
                                            marginBottom:
                                                index === contents.length - 1
                                                    ? '0'
                                                    : '15px', // Remove margin for the last image
                                        }}
                                    >
                                        <img
                                            style={{ borderRadius: '4px' }}
                                            src={content.image_url?.url}
                                            alt="Chat Image"
                                            className="chat-image"
                                        />
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatBalloonSelf
