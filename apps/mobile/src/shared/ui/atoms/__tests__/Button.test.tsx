import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../test/render';
import { Button } from '../Button';

describe('<Button />', () => {
  it('exposes its label as accessible name', () => {
    const { getByRole } = renderWithProviders(<Button label="Save" onPress={() => undefined} />);
    expect(getByRole('button')).toHaveTextContent('Save');
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithProviders(<Button label="Tap" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress while loading', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <Button label="Tap" loading onPress={onPress} />
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('marks itself busy for screen readers while loading', () => {
    const { getByRole } = renderWithProviders(
      <Button label="Tap" loading onPress={() => undefined} />
    );
    expect(getByRole('button').props.accessibilityState).toMatchObject({ busy: true });
  });
});
