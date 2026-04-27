import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@shared/ui/atoms/Screen';
import { Text } from '@shared/ui/atoms/Text';
import { Button } from '@shared/ui/atoms/Button';
import { useAuthStore } from '@shared/store/auth.store';

export function ProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  return (
    <Screen>
      <View style={{ gap: 12 }}>
        <Text variant="h1">{t('tabs.profile')}</Text>
        {user ? <Text muted>{`${user.firstName} ${user.lastName}`}</Text> : null}
        <Button variant="ghost" label={t('auth.logout')} onPress={() => void clear()} />
      </View>
    </Screen>
  );
}
