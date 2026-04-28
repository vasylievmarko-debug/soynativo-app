import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
// @ts-ignore
import { Input } from '../../mobile/src/shared/ui/atoms/Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    invalid: { control: 'boolean' },
    editable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Введите email',
    style: { width: 300, height: 44 },
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Email',
    invalid: true,
    style: { width: 300, height: 44 },
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Недоступно',
    editable: false,
    style: { width: 300, height: 44 },
  },
};

export const Password: Story = {
  args: {
    placeholder: 'Пароль',
    secureTextEntry: true,
    style: { width: 300, height: 44 },
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Email',
    value: 'user@example.com',
    style: { width: 300, height: 44 },
    editable: false,
  },
};
