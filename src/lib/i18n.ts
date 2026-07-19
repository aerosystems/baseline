import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uk: {
    translation: {
      // Header
      'header.title': 'Операційні системи',
      'header.signIn': 'Увійти',
      'header.signInTooltip': 'Буде доступно у v2',

      // Roadmap
      'roadmap.backToRoadmap': '← До роадмапи',
      'roadmap.readingTime': '{{minutes}} хв читання',
      'roadmap.soon': 'скоро',

      // Legend
      'legend.title': 'Позначення',
      'legend.lecture': 'Лекція',
      'legend.lab': 'Лабораторна',
      'legend.event': 'Семінар / Контрольна',

      // Lecture page
      'lecture.stubMessage': 'Матеріал цієї теми готується…',
      'lecture.noTranslation': 'Переклад відсутній — показано українську версію',

      // Theme
      'theme.day': 'Денна тема',
      'theme.night': 'Нічна тема',
    },
  },
  en: {
    translation: {
      // Header
      'header.title': 'Operating Systems',
      'header.signIn': 'Sign in',
      'header.signInTooltip': 'Coming in v2',

      // Roadmap
      'roadmap.backToRoadmap': '← Back to roadmap',
      'roadmap.readingTime': '{{minutes}} min read',
      'roadmap.soon': 'soon',

      // Legend
      'legend.title': 'Legend',
      'legend.lecture': 'Lecture',
      'legend.lab': 'Lab',
      'legend.event': 'Seminar / Test',

      // Lecture page
      'lecture.stubMessage': 'This content is being prepared…',
      'lecture.noTranslation': 'No translation yet — showing the Ukrainian version',

      // Theme
      'theme.day': 'Day theme',
      'theme.night': 'Night theme',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'uk',
    fallbackLng: 'uk',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
