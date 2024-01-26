import { useTranslation, registerModuleTranslation } from 'component/base';

import commonAr from '../locales/ar/common.json';
import commonEn from '../locales/en-US/common.json';
import commonTr from '../locales/tr-TR/common.json';

import enumsAr from '../locales/ar/enums.json';
import enumsEn from '../locales/en-US/enums.json';
import enumsTr from '../locales/tr-TR/enums.json';

import uiKeyAr from '../locales/ar/uiKey.json';
import uiKeyEn from '../locales/en-US/uiKey.json';
import uiKeyTr from '../locales/tr-TR/uiKey.json';

import moduleInfo from './moduleInfo';


const moduleTranslation = {
  common: {
    'ar': commonAr,
    'en-US': commonEn,
    'tr-TR': commonTr
  },
  enums: {
    'ar': enumsAr,
    'en-US': enumsEn,
    'tr-TR': enumsTr
  },
  uiKey: {
    'ar': uiKeyAr,
    'en-US': uiKeyEn,
    'tr-TR': uiKeyTr
  },
};

const register = () => registerModuleTranslation(moduleInfo.name, moduleTranslation);

const useModuleTranslation = () => useTranslation({ moduleName: moduleInfo.name });

export { register, useModuleTranslation };
export default { register, useModuleTranslation };
