import React from 'react';
import { useTranslation } from 'react-i18next';
import { Screen } from '@shared/ui/atoms/Screen';
import { Text } from '@shared/ui/atoms/Text';

export function BookingsScreen(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="h1">{t('tabs.bookings')}</Text>
      <Text muted>{t('bookings.empty')}</Text>
    </Screen>
  );
}
