import React, { useEffect, useRef, useState } from 'react'
import ClockShape from '../../../../package/mock-components/shapes/ClockShape.tsx'
import { useClickOutside } from '../../../../package/hooks/useClickOutside.ts'
import ArrowShape from '../../../../package/mock-components/shapes/ArrowShape.tsx'
import Btn from '../../../../package/mock-components/Btn.tsx'
import CrossShape from '../../../../package/mock-components/shapes/CrossShape.tsx'
import type { SearchHistory } from '../../types/SearchHistory.types'
import { listSearchHistories } from 'src/server/database/searchHistory'
import { useTranslation } from 'react-i18next'

interface SuggestFormProps {
    onChange: (value: string) => void
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
    suggestWords: string[]
    defaultValue?: string
    role?: 'set-group' | 'filter-group'
}

const SuggestForm = ({
    onChange,
    onFocus,
    suggestWords,
    defaultValue = '',
    role = 'set-group',
}: SuggestFormProps) => {
    const { t } = useTranslation()
    const suggestWordsOther = suggestWords

    const themeFieldRef = useRef<HTMLInputElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)
    const toggleRef = useRef<HTMLButtonElement>(null)
    const optionsRef = useRef<HTMLUListElement>(null)
    const [isFieldFocused, setIsFieldFocused] = useState(false)
    const [isSuggestKeywordsOpen, setIsSuggestKeywordsOpen] = useState(false)
    const [currentInput, setCurrentInput] = useState(defaultValue)
    const [searchHistories, setSearchHistories] = useState<SearchHistory[]>([])

    useEffect(() => {
        const fetch = async () => {
            const res = await listSearchHistories()
            setSearchHistories(res.slice(0, 5))
        }
        fetch()
    }, [])

    const label = () => {
        switch (role) {
            case 'filter-group':
                return t('suggestForm.filterGroup.currentGroups')
            default: // 'set-group' のとき
                return t('suggestForm.setGroup.other')
        }
    }

    // popup のCSS modifier
    const popupModifier = `
        ${isFieldFocused && 'popup--active'}
        ${!isSuggestKeywordsOpen && role === 'set-group' ? 'popup--down popup--no-border' : ''}`

    // popup 内のテキストフィールドのCSS modifier
    const fieldInPopupModifier = `${!isSuggestKeywordsOpen && role === 'set-group' ? 'current' : ''}`

    // popup 内のサジェスト文言一覧のCSS modifier
    const suggestsInPopupModifier = `${isSuggestKeywordsOpen ? 'words--active' : ''}`

    /**
     * @deprecated
     * suggestWords中から入力値と前方一致するもの（未使用）
     */
    const startsWith = suggestWords.filter((word) =>
        word.startsWith(currentInput)
    )

    /**
     * suggestWords中から入力値と部分一致するもの
     */
    const partialMatch = suggestWords.filter(
        (word) => word.indexOf(currentInput) !== -1
    )

    const regex = new RegExp(`(${currentInput})`, 'g')

    const handleThemeFieldFocusToggle = () => {
        //テーマ入力欄にフォーカスするとき、popupと追加キーワード設定欄を表示
        //テーマ入力欄からフォーカスを外すとき、popupは非表示になるが追加キーワード設定欄は表示されたまま
        setIsFieldFocused(!isFieldFocused)
        setIsSuggestKeywordsOpen(true)
    }

    useEffect(() => {
        if (isFieldFocused && themeFieldRef.current) {
            // 入力欄が非表示状態のとき、Visibility:hiddenが設定されていてfocus()が機能しないので、
            // requestAnimationFrameを用いて確実にフォーカスする。
            requestAnimationFrame(() => {
                // １回目のrequestAnimationFrame呼び出し時にはCSSの変更が確定されていない
                requestAnimationFrame(() => {
                    // ２回目のrequestAnimationFrame後はCSSの変更が確定されているので、ここでfocus()を実行。
                    themeFieldRef.current?.focus()
                })
            })
        }
    }, [isFieldFocused])

    useEffect(() => {
        onChange(currentInput)
    }, [currentInput])

    const selectSuggestWord = (word: string) => {
        if (themeFieldRef.current) {
            themeFieldRef.current.value = word
            setCurrentInput(word)
            setIsSuggestKeywordsOpen(false)
            // role が set-group の場合は入力欄にフォーカスする
            if (role === 'set-group') themeFieldRef.current.focus()
            // role が filter-group の場合は入力欄のフォーカスを外す
            if (role === 'filter-group') setIsFieldFocused(false)
        }
    }

    useClickOutside(popupRef, isFieldFocused, () => {
        setIsFieldFocused(false)
    })

    return (
        <div className="SuggestForm">
            {/* 非フォーカス時に入力内容を表示する要素 */}
            {role === 'set-group' && (
                <button
                    ref={toggleRef}
                    onClick={handleThemeFieldFocusToggle}
                    className={`field ${currentInput.trim() === '' ? 'field--empty' : 'field--inputted'}`}
                >
                    <span className="text">
                        {currentInput
                            ? currentInput
                            : t('suggestForm.enterGroupName')}
                    </span>
                </button>
            )}
            {role === 'filter-group' && (
                <div className="grid">
                    <div
                        className={`button ${isFieldFocused ? 'button--focused' : ''}`}
                    >
                        <div className="shift">
                            <Btn
                                size="sm-icon"
                                color="secondly"
                                label={
                                    currentInput.trim() === ''
                                        ? t('suggestForm.filterGroup.label')
                                        : `${t('suggestForm.filterGroup.label')}：${currentInput}`
                                }
                                onClick={handleThemeFieldFocusToggle}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* フォーカス時に表示される入力欄 */}
            <div ref={popupRef} className={`popup ${popupModifier}`}>
                <input
                    className={`field ${fieldInPopupModifier}`}
                    value={currentInput}
                    ref={themeFieldRef}
                    onChange={(event) => setCurrentInput(event.target.value)}
                    onFocus={onFocus}
                    onClick={() =>
                        /* role が set-group のときは、isSuggestKeywordsOpen をトグルする */
                        role === 'set-group' &&
                        setIsSuggestKeywordsOpen(!isSuggestKeywordsOpen)
                    }
                    type="text"
                    placeholder={t('suggestForm.enterGroupName')}
                />
                <button
                    className={`delete ${currentInput.trim() === '' ? 'delete--hidden' : ''}`}
                    onClick={() => {
                        setCurrentInput('')
                        if (themeFieldRef.current)
                            themeFieldRef.current.value = ''
                    }}
                    disabled={currentInput.trim() === ''}
                >
                    <CrossShape />
                </button>
                <ul
                    ref={optionsRef}
                    className={`words ${suggestsInPopupModifier}`}
                >
                    {/*role が set-group かつ未入力の場合、ラベルより上に履歴を表示*/}
                    {currentInput.trim() === '' &&
                        role === 'set-group' &&
                        searchHistories.map((word, index) => (
                            <li key={index} className="word">
                                <button
                                    className="text"
                                    onClick={() =>
                                        selectSuggestWord(word.search_query)
                                    }
                                >
                                    <span className="icon">
                                        <ClockShape />
                                    </span>
                                    <span>{word.search_query}</span>
                                </button>
                            </li>
                        ))}

                    {/* ラベル */}
                    {currentInput.trim() === '' ? (
                        <li className="category">{label()}</li>
                    ) : (
                        <li className="category">
                            {partialMatch.length === 0
                                ? t('suggestForm.noMatchedGroup')
                                : t('suggestForm.matchedGroup')}
                        </li>
                    )}

                    {/* role が filter-group かつ未入力の場合、すべてのグループを表示 */}
                    {currentInput.trim() === '' &&
                        role === 'filter-group' &&
                        suggestWords.map((word, index) => (
                            <li key={index} className="word">
                                <button
                                    className="text"
                                    onClick={() => selectSuggestWord(word)}
                                >
                                    <span className="icon icon--arrow">
                                        <ArrowShape />
                                    </span>
                                    <span>{word}</span>
                                </button>
                            </li>
                        ))}

                    {/* 入力内容と部分一致するものを表示 */}
                    {currentInput.trim() !== '' &&
                        partialMatch.map((word, index) => (
                            <li key={index} className="word">
                                <button
                                    className="text"
                                    onClick={() => selectSuggestWord(word)}
                                >
                                    <span className="icon icon--arrow">
                                        <ArrowShape />
                                    </span>
                                    <span>
                                        {word.split(regex).map((part, index) =>
                                            index % 2 === 1 ? (
                                                <span
                                                    key={index}
                                                    className="font-bold"
                                                >
                                                    {part}
                                                </span>
                                            ) : (
                                                <span key={index}>{part}</span>
                                            )
                                        )}
                                    </span>
                                </button>
                            </li>
                        ))}

                    {/* role が set-group のみ「その他」項目を表示 */}
                    {currentInput.trim() === '' &&
                        role === 'set-group' &&
                        suggestWordsOther.map((word, index) => (
                            <li key={index} className="word">
                                <button
                                    className="text"
                                    onClick={() => selectSuggestWord(word)}
                                >
                                    <span className="icon icon--arrow">
                                        <ArrowShape />
                                    </span>
                                    <span>{word}</span>
                                </button>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    )
}

export default SuggestForm
