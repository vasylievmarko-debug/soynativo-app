import React from 'react';
import { ActivityIndicator, FlatList, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@shared/ui/atoms/Screen';
import { Text } from '@shared/ui/atoms/Text';
import { useTheme } from '@shared/ui/theme/ThemeProvider';
import { useLessons } from '../hooks/useLessons';
import { formatDate, getLevelLabel } from '@soynativo/shared';

export function LessonsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, fetchNextPage, hasNextPage } = useLessons();

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator />
      </Screen>
    );
  }

  const items = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text muted>{t('lessons.empty')}</Text>}
        onEndReachedThreshold={0.5}
        onEndReached={() => hasNextPage && fetchNextPage()}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.colors.border }} />
        )}
        renderItem={({ item }) => (
          <View style={[styles.row, { paddingVertical: theme.spacing.md }]}>
            <Text variant="h2">{item.title}</Text>
            <Text muted>{`${item.teacher.firstName} ${item.teacher.lastName} · ${getLevelLabel(item.level)}`}</Text>
            <Text variant="caption" muted>{formatDate(new Date(item.startTime))}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { gap: 4 },
});
