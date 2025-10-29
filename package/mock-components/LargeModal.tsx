import React from 'react'
import CrossShape from './shapes/CrossShape.tsx'
import { BackfaceScrollingDisabled } from 'talk-app/src/store/store.ts'
import useAnimationClose from '../hooks/useAnimationClose.ts'

interface LargeModalProps {
    title: string
    children: (handleLargeModalClose: () => void) => React.ReactNode
    onModalClose: () => void
}
const LargeModal = ({ title, children, onModalClose }: LargeModalProps) => {
    const onBeforeClose = () => {
        BackfaceScrollingDisabled.set(false)
    }

    const onClose = () => {
        onModalClose()
    }

    const { isCloseAnimating, handleClose, handleAnimationEnd } =
        useAnimationClose(onBeforeClose, onClose)

    //呼び出し元のコンポーネントのhandleClose関数と重複しないためにラップ
    const handleLargeModalClose = () => {
        handleClose()
    }

    return (
        <div
            className={`Modal Modal--large ${isCloseAnimating ? 'Modal--close' : 'Modal--open'}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className="inner">
                <button
                    className="overlay"
                    onClick={handleLargeModalClose}
                ></button>
                <div className="content">
                    <button className="close" onClick={handleLargeModalClose}>
                        <CrossShape />
                    </button>
                    <div className="title">{title}</div>
                    <div className="children">
                        {children ? children(handleLargeModalClose) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LargeModal
