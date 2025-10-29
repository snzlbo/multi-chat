import React, {
    useLayoutEffect,
    useRef,
    type ChangeEvent,
    useEffect,
} from 'react'

interface AutoResizingTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value?: string
    placeholder?: string
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    onCompositionStart?: () => void
    onCompositionEnd?: () => void
    minHeight?: number
    maxHeight?: number
    modifier?: string
    singleLine?: boolean
}

/** 最も近いスクロール可能な祖先要素を取得（自身は除外） */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
    let parent = el?.parentElement
    while (parent) {
        const style = getComputedStyle(parent)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
            return parent
        }
        parent = parent.parentElement
    }
    return null
}

const AutoResizingTextarea: React.FC<AutoResizingTextareaProps> = ({
    value = '',
    placeholder = '',
    onChange,
    onKeyDown = () => {},
    onCompositionStart = () => {},
    onCompositionEnd = () => {},
    minHeight = 0,
    maxHeight = 3000,
    modifier = '',
    singleLine = false,
    ...rest
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const mirrorRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const textarea = textareaRef.current!
        const mirror = mirrorRef.current!

        // テキストエリア自体をautoの値にしながら計測を繰り返すとレイアウトシフトの原因となるため、
        // 入力値を同期させるdiv要素（ミラー）を用いて高さを計測する。

        // ミラー要素へのスタイル同期
        const style = getComputedStyle(textarea)
        mirror.style.font = style.font
        mirror.style.lineHeight = style.lineHeight
        mirror.style.padding = style.padding
        mirror.style.width = `${textarea.clientWidth}px`

        // ミラー要素へのテキスト設定
        // singleLine が true の場合、1行目だけを取得して反映。
        let text = singleLine ? value.split('\n')[0] || '' : value || ''
        // 改行のみの末尾行があるとミラー要素の高さに含まれないので、スペースを追加。
        if (!singleLine && /\n$/.test(value)) text += '\u200B'
        mirror.textContent = text || placeholder || ''

        // ミラー要素の高さを計測
        const measured = mirror.offsetHeight + 1
        const newHeight = Math.min(Math.max(measured, minHeight), maxHeight)

        // ビューポート外にカーソルがあるとき、
        // 強制的にスクロール位置が調整されブラウザの慣性スクロールと競合して表示の不具合を起こすため、
        // 親要素のスクロール位置を再指定する。
        const container = getScrollParent(textarea) || document.documentElement
        // 親要素のスクロール位置を取得。
        const scrollTop = container.scrollTop

        // テキストエリアのリサイズを実行
        textarea.style.height = `${newHeight}px`

        // 親要素のスクロール位置を設定。
        requestAnimationFrame(() => {
            container.scrollTop = scrollTop
        })
    }, [value, placeholder, minHeight, maxHeight, singleLine])

    return (
        <div className="AutoResizingTextarea">
            <div ref={mirrorRef} className={'mirror'} aria-hidden="true" />
            <textarea
                {...rest}
                ref={textareaRef}
                className={`textarea ${modifier}`}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                onCompositionStart={onCompositionStart}
                onCompositionEnd={onCompositionEnd}
                onKeyDown={onKeyDown}
            />
        </div>
    )
}

export default AutoResizingTextarea
