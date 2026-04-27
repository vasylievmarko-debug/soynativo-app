import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
// @ts-ignore
import { List } from '../../apps/mobile/src/shared/ui/molecules/List';
// @ts-ignore
import { ListItem } from '../../apps/mobile/src/shared/ui/molecules/ListItem';

const meta: Meta<typeof List> = {
  title: 'Molecules/List',
  component: List,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof List>;

const sampleData = [
  { id: '1', title: 'Пункт списка 1', subtitle: 'Подзаголовок' },
  { id: '2', title: 'Пункт списка 2', subtitle: 'Подзаголовок' },
  { id: '3', title: 'Пункт списка 3', subtitle: 'Подзаголовок' },
];

export const Default: Story = {
  render: () => (
    <View style={{ width: '100%', maxWidth: 375 }}>
      <List
        data={sampleData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListItem title={item.title} subtitle={item.subtitle} />}
      />
    </View>
  ),
};

export const WithDivider: Story = {
  render: () => (
    <View style={{ width: '100%', maxWidth: 375 }}>
      <List
        data={sampleData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListItem title={item.title} subtitle={item.subtitle} />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#e0e0e0' }} />}
      />
    </View>
  ),
};
