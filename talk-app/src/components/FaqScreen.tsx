import { useStore } from '@nanostores/react'
import useAnimationClose from '../../../package/hooks/useAnimationClose'
import {
    homePositionShift,
    bottomAppBarOpened,
    homeOpened,
    settingOpened,
    faqOpened,
} from '@store/store.ts'
import React, { useRef } from 'react'
import LargeCrossShape from '../../../package/mock-components/shapes/LargeCrossShape'
import ArrowShape from '../../../package/mock-components/shapes/ArrowShape'
import AnchorScrollLink from '../../../package/mock-components/AnchorScrollLink'
import Faq from '../../../package/mock-components/Faq'
import { useCrossFadeOutSetting } from '../../../package/hooks/useCrossFadeOutSetting.ts'
import { Trans, useTranslation } from 'react-i18next'

const faqScreen = () => {
    const { t } = useTranslation()
    const faqRef = useRef<HTMLDivElement>(null)
    const isFaqOpened = useStore(faqOpened)

    const onBeforeClose = () => {
        useCrossFadeOutSetting(faqRef, homePositionShift)
        window.scrollTo(0, 0)
    }

    const onClose = () => {
        faqOpened.set(false)
    }

    const { isCloseAnimating, handleClose, handleAnimationEnd } =
        useAnimationClose(onBeforeClose, onClose)

    const handleFaqClose = (dist: 'setting' | 'home') => {
        switch (dist) {
            case 'setting':
                settingOpened.set(true)
                break
            default:
                homeOpened.set(true)
                bottomAppBarOpened.set(true)
                break
        }
        handleClose()
    }

    return (
        <div>
            {isFaqOpened && (
                <div
                    ref={faqRef}
                    className={`SettingScreen ${isCloseAnimating ? 'SettingScreen--close' : 'SettingScreen--open'} scroll-gutter`}
                    onAnimationEnd={handleAnimationEnd}
                >
                    <div className="inner">
                        <div className="grid gap-16">
                            <div className="SettingScreenProps--faq">
                                <div className="head">
                                    <h2 className="title">FAQ</h2>
                                    <div className="SettingScreenProps--anchors">
                                        <AnchorScrollLink
                                            label={t('faq.category1.category')}
                                            target="#FAQ1"
                                            offset={76}
                                        />
                                        <AnchorScrollLink
                                            label={t('faq.category2.category')}
                                            target="#FAQ2"
                                            offset={76}
                                        />
                                        <AnchorScrollLink
                                            label={t('faq.category3.category')}
                                            target="#FAQ3"
                                            offset={76}
                                        />
                                        <AnchorScrollLink
                                            label={t('faq.category4.category')}
                                            target="#FAQ4"
                                            offset={76}
                                        />
                                        <AnchorScrollLink
                                            label={t('faq.category5.category')}
                                            target="#FAQ5"
                                            offset={76}
                                        />
                                        <AnchorScrollLink
                                            label={t('faq.category6.category')}
                                            target="#FAQ6"
                                            offset={76}
                                        />
                                    </div>
                                </div>
                                <div className="list">
                                    <div id="FAQ1" className="group">
                                        <h3 className="SettingScreenProps--heading">
                                            {t('faq.category1.category')}
                                        </h3>
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category1.questions.q1.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category1.questions.q1.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category1.questions.q2.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        <Trans
                                                            i18nKey={
                                                                'faq.category1.questions.q2.a'
                                                            }
                                                            components={{
                                                                l: (
                                                                    <a
                                                                        target="_blank"
                                                                        href="mailto:aiqqqstudio@dentsu.co.jp"
                                                                        className="TextLink"
                                                                    ></a>
                                                                ),
                                                            }}
                                                        />
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category1.questions.q3.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category1.questions.q3.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category1.questions.q4.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category1.questions.q4.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category1.questions.q5.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category1.questions.q5.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category1.questions.q6.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category1.questions.q6.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div id="FAQ2" className="group">
                                        <h3 className="SettingScreenProps--heading">
                                            {t('faq.category2.category')}
                                        </h3>
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category2.questions.q1.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category2.questions.q1.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category2.questions.q2.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category2.questions.q2.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category2.questions.q3.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category2.questions.q3.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category2.questions.q4.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category2.questions.q4.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category2.questions.q5.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category2.questions.q5.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div id="FAQ3" className="group">
                                        <h3 className="SettingScreenProps--heading">
                                            {t('faq.category3.category')}
                                        </h3>
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category3.questions.q1.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        <Trans
                                                            i18nKey={
                                                                'faq.category3.questions.q1.a'
                                                            }
                                                            components={{
                                                                l: (
                                                                    <a
                                                                        target="_blank"
                                                                        href="mailto:watabe.kazuhiro@dentsudigital.co.jp "
                                                                        className="TextLink"
                                                                    ></a>
                                                                ),
                                                            }}
                                                        />
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category3.questions.q2.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category3.questions.q2.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div id="FAQ4" className="group">
                                        <h3 className="SettingScreenProps--heading">
                                            {t('faq.category4.category')}
                                        </h3>
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category4.questions.q1.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category4.questions.q1.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category4.questions.q2.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category4.questions.q2.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div id="FAQ5" className="group">
                                        <h3 className="SettingScreenProps--heading">
                                            {t('faq.category5.category')}
                                        </h3>
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category5.questions.q1.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        <Trans
                                                            i18nKey={
                                                                'faq.category5.questions.q1.a'
                                                            }
                                                            components={{
                                                                l: (
                                                                    <a
                                                                        target="_blank"
                                                                        href="mailto:watabe.kazuhiro@dentsudigital.co.jp "
                                                                        className="TextLink"
                                                                    ></a>
                                                                ),
                                                            }}
                                                        />
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category5.questions.q2.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category5.questions.q2.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category5.questions.q3.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category5.questions.q3.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </div>
                                    <div id="FAQ6" className="group">
                                        <h3 className="SettingScreenProps--heading">
                                            {t('faq.category6.category')}
                                        </h3>
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category6.questions.q1.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category6.questions.q1.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <Faq
                                            question={
                                                <div>
                                                    {t(
                                                        'faq.category6.questions.q2.q'
                                                    )}
                                                </div>
                                            }
                                            answer={
                                                <div className="content">
                                                    <p>
                                                        {t(
                                                            'faq.category6.questions.q2.a'
                                                        )}
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="IconBtn back"
                            onClick={() => handleFaqClose('setting')}
                        >
                            <ArrowShape />
                        </button>

                        <button
                            className="IconBtn close"
                            onClick={() => handleFaqClose('home')}
                        >
                            <LargeCrossShape />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default faqScreen
