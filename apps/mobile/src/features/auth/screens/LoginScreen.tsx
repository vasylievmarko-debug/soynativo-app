import React, { useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@shared/ui/atoms/Screen';
import { Text } from '@shared/ui/atoms/Text';
import { Button } from '@shared/ui/atoms/Button';
import { useTheme } from '@shared/ui/theme/ThemeProvider';
import { useLogin } from '../hooks/useLogin';

export function LoginScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="h1">{t('auth.signIn')}</Text>
        <TextInput
          accessibilityLabel={t('auth.email')}
          placeholder={t('auth.email')}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholderTextColor={theme.colors.textMuted}
        />
        <TextInput
          accessibilityLabel={t('auth.password')}
          placeholder={t('auth.password')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholderTextColor={theme.colors.textMuted}
        />
        {login.isError ? <Text color={theme.colors.danger}>{t('common.error')}</Text> : null}
        <Button
          label={t('auth.signIn')}
          loading={login.isPending}
          onPress={() => login.mutate({ email, password })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 44 },
});
