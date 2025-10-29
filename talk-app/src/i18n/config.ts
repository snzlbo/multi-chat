import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import fr_dropZone from '../../../package/mock-components/locale/fr/dropZone.json'
import en_dropZone from '../../../package/mock-components/locale/en/dropZone.json'
import fr_onboardingSlide from '../../../package/mock-components/locale/fr/onboardingSlide.json'
import en_onboardingSlide from '../../../package/mock-components/locale/en/onboardingSlide.json'

import fr_common from './locale/fr/common.json'
import en_common from './locale/en/common.json'
import fr_dummy from './locale/fr/dummy.json'
import en_dummy from './locale/en/dummy.json'
import fr_extractPromptSetting from './locale/fr/extractPromptSetting.json'
import en_extractPromptSetting from './locale/en/extractPromptSetting.json'
import fr_faq from './locale/fr/faq.json'
import en_faq from './locale/en/faq.json'
import fr_imageSetting from './locale/fr/imageSetting.json'
import en_imageSetting from './locale/en/imageSetting.json'
import fr_onboarding from './locale/fr/onboarding.json'
import en_onboarding from './locale/en/onboarding.json'
import fr_listSetting from './locale/fr/listSetting.json'
import en_listSetting from './locale/en/listSetting.json'
import fr_multipleSelect from './locale/fr/multipleSelect.json'
import en_multipleSelect from './locale/en/multipleSelect.json'
import fr_persona from './locale/fr/persona.json'
import en_persona from './locale/en/persona.json'
import fr_personaDetail from './locale/fr/personaDetail.json'
import en_personaDetail from './locale/en/personaDetail.json'
import fr_personaImport from './locale/fr/personaImport.json'
import en_personaImport from './locale/en/personaImport.json'
import fr_personaRegister from './locale/fr/personaRegister.json'
import en_personaRegister from './locale/en/personaRegister.json'
import fr_personaTalk from './locale/fr/personaTalk.json'
import en_personaTalk from './locale/en/personaTalk.json'
import fr_setting from './locale/fr/setting.json'
import en_setting from './locale/en/setting.json'
import fr_suggestForm from './locale/fr/suggestForm.json'
import en_suggestForm from './locale/en/suggestForm.json'

i18n.use(initReactI18next).init({
    resources: {
        fr: {
            translation: {
                dropZone: fr_dropZone,
                onboardingSlide: fr_onboardingSlide,
                common: fr_common,
                dummy: fr_dummy,
                extractPromptSetting: fr_extractPromptSetting,
                faq: fr_faq,
                imageSetting: fr_imageSetting,
                listSetting: fr_listSetting,
                multipleSelect: fr_multipleSelect,
                onboarding: fr_onboarding,
                persona: fr_persona,
                personaDetail: fr_personaDetail,
                personaImport: fr_personaImport,
                personaRegister: fr_personaRegister,
                personaTalk: fr_personaTalk,
                setting: fr_setting,
                suggestForm: fr_suggestForm,
            },
        },
        en: {
            translation: {
                dropZone: en_dropZone,
                onboardingSlide: en_onboardingSlide,
                common: en_common,
                dummy: en_dummy,
                extractPromptSetting: en_extractPromptSetting,
                faq: en_faq,
                imageSetting: en_imageSetting,
                listSetting: en_listSetting,
                multipleSelect: en_multipleSelect,
                onboarding: en_onboarding,
                persona: en_persona,
                personaDetail: en_personaDetail,
                personaImport: en_personaImport,
                personaRegister: en_personaRegister,
                personaTalk: en_personaTalk,
                setting: en_setting,
                suggestForm: en_suggestForm,
            },
        },
    },
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: {
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'span', 'a'],
    },
})

export default i18n
