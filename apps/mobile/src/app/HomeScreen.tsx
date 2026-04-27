import React from 'react';
import { useTranslation } from 'react-i18next';
import { Screen } from '@shared/ui/atoms/Screen';
import { Text } from '@shared/ui/atoms/Text';

export function HomeScreen(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="h1">{t('common.appName')}</Text>
      <Text muted>{t('tabs.home')}</Text>
    </Screen>
  );
}
