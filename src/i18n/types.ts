/**
 * i18next TypeScript augmentation.
 * useTranslation('tasks') → t('status.draft') gibi çağrılarda
 * tam tip güvenliği ve auto-complete sağlar.
 */
import 'i18next';

import type trAuth from '../locales/tr/auth.json';
import type trCommon from '../locales/tr/common.json';
import type trMap from '../locales/tr/map.json';
import type trProfile from '../locales/tr/profile.json';
import type trTasks from '../locales/tr/tasks.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof trCommon;
      auth: typeof trAuth;
      map: typeof trMap;
      tasks: typeof trTasks;
      profile: typeof trProfile;
    };
  }
}
