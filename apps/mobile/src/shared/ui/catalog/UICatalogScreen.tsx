import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  ListItem,
  Screen,
  Spinner,
  Stack,
  Text,
  useTheme,
} from '../';

/**
 * UI Catalog — живая галерея всех компонентов дизайн-системы. Дизайнер
 * сравнивает с макетами в Figma; разработчик видит, какие компоненты уже
 * есть, прежде чем писать новый.
 *
 * Включить в navigation в dev-сборке (см. RootNavigator).
 */
export function UICatalogScreen(): React.ReactElement {
  const theme = useTheme();
  const [email, setEmail] = useState('');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: theme.spacing.lg, gap: theme.spacing.xl }}>
        <Section title="Typography">
          <Text variant="display">Display</Text>
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="body">Body — обычный текст параграфа.</Text>
          <Text variant="bodyStrong">Body Strong</Text>
          <Text variant="caption" muted>Caption muted</Text>
          <Text variant="overline">Overline</Text>
        </Section>

        <Section title="Colors">
          <Stack direction="row" gap="sm">
            {(['primary', 'success', 'warning', 'danger', 'info'] as const).map((c) => (
              <View
                key={c}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: theme.radius.md,
                  backgroundColor: theme.colors[c],
                }}
                accessibilityLabel={c}
              />
            ))}
          </Stack>
        </Section>

        <Section title="Buttons">
          <Stack gap="sm">
            <Button label="Primary" onPress={() => undefined} />
            <Button label="Secondary" variant="secondary" onPress={() => undefined} />
            <Button label="Ghost" variant="ghost" onPress={() => undefined} />
            <Button label="Danger" variant="danger" onPress={() => undefined} />
            <Button label="Loading" loading onPress={() => undefined} />
            <Button label="Disabled" disabled onPress={() => undefined} />
          </Stack>
        </Section>

        <Section title="Inputs">
          <FormField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            hint="We never share your email."
          />
          <FormField label="Password" secureTextEntry error="Password is required." />
        </Section>

        <Section title="Badges">
          <Stack direction="row" gap="sm">
            <Badge label="Neutral" />
            <Badge label="Success" tone="success" />
            <Badge label="Warning" tone="warning" />
            <Badge label="Danger" tone="danger" />
            <Badge label="Info" tone="info" />
          </Stack>
        </Section>

        <Section title="Cards & lists">
          <Card>
            <Text variant="h3">Card title</Text>
            <Text muted>Card content uses the surface color and elevation.</Text>
          </Card>
          <Card padded={false}>
            <ListItem title="Maria García" subtitle="Spanish · A2" leading={<Avatar name="Maria García" />} />
            <ListItem title="Carlos Pérez" subtitle="Spanish · B1" leading={<Avatar name="Carlos Pérez" />} />
          </Card>
        </Section>

        <Section title="Feedback">
          <Spinner />
          <View style={{ height: 200, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg }}>
            <EmptyState
              title="No lessons yet"
              description="Once your teacher schedules a lesson, it'll show up here."
              actionLabel="Refresh"
              onAction={() => undefined}
            />
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="overline" muted>{title}</Text>
      <Stack gap="md">{children}</Stack>
    </View>
  );
}
