import { ImageSourcePropType } from 'react-native';

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Saha Operasyonlarını\nKontrol Altına Al',
    description:
      'Tüm saha faaliyetlerinizi tek bir platformdan planlayın, izleyin ve gerçek zamanlı olarak koordine edin.',
    image: require('../../../../assets/onboarding/map.png'),
  },
  {
    id: '2',
    title: 'Görevlerini Akıllı\nŞekilde Yönet',
    description:
      'Ekibinize görev atayın, önceliklendirin ve anlık ilerleme durumunu kolayca takip edin.',
    image: require('../../../../assets/onboarding/task.png'),
  },
  {
    id: '3',
    title: 'İnternet Olmasa\nBile Çalış',
    description:
      'Bağlantısız ortamlarda bile kesintisiz çalışın; verileriniz hazır olduğunda otomatik senkronize edilir.',
    image: require('../../../../assets/onboarding/offline.png'),
  },
];
