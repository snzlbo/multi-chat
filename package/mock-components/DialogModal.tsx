import React from 'react'
import CrossShape from './shapes/CrossShape.tsx'
import { BackfaceScrollingDisabled } from 'talk-app/src/store/store.ts'
import useAnimationClose from '../hooks/useAnimationClose.ts'

type DialogModalProps = {
    label?: React.ReactNode
    message?: React.ReactNode
    control: (handleDialogModalClose: () => void) => React.ReactNode
    onModalClose: () => void
    keepBackfaceScrollingState?: boolean
}

const DialogModal = ({
    label,
    message,
    control,
    onModalClose,
    keepBackfaceScrollingState = false,
}: DialogModalProps) => {
    const onBeforeClose = () => {
        // trueの場合、モーダルを閉じるときに背景のスクロールロックを解除しない。
        // モーダル中の子モーダルなどで使用。
        if (keepBackfaceScrollingState) return
        BackfaceScrollingDisabled.set(false)
    }

    const onClose = () => {
        onModalClose()
    }

    const { isCloseAnimating, handleClose, handleAnimationEnd } =
        useAnimationClose(onBeforeClose, onClose)

    //呼び出し元のコンポーネントのhandleClose関数と重複しないためにラップ
    const handleDialogModalClose = () => {
        handleClose()
        onModalClose()
    }

    return (
        <div
            className={`Modal Modal--open'}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className="inner">
                <button
                    className="overlay"
                    onClick={handleDialogModalClose}
                ></button>
                <div className="content">
                    <button className="close" onClick={handleDialogModalClose}>
                        <CrossShape />
                    </button>
                    <div className={`label ${!label ? 'label--empty' : ''}`}>
                        {label}
                    </div>
                    <div className="message">{message}</div>
                    <div className="control">
                        {control ? control(handleDialogModalClose) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DialogModal
