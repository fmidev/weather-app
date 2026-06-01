import React from 'react';
import { render } from '@testing-library/react-native';

import SliderStep from '../../src/components/map/ui/SliderStep';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#333333',
      timeSliderTick: '#999999',
      primary: '#0062cc',
    },
  }),
}));

describe('SliderStep', () => {
  it('renders regular full-hour step with observation color', () => {
    const { toJSON } = render(
      <SliderStep
        clockType={24}
        index={0}
        isLast={false}
        isObservation
        item={3600}
        sliderWidth={300}
        step={3600}
        stepWidth={60}
      />
    );

    const tree = toJSON() as any;
    expect(tree.children[0]).toBeTruthy();
    const containerStyles = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedContainerStyle = Object.assign({}, ...containerStyles);
    expect(mergedContainerStyle.marginLeft).toBe(70);

    const tick = tree.children[1];
    const tickStyles = Array.isArray(tick.props.style)
      ? tick.props.style
      : [tick.props.style];
    const mergedTickStyle = Object.assign({}, ...tickStyles);
    expect(mergedTickStyle.borderBottomColor).toBe('#999999');
  });

  it('renders last step and forecast color', () => {
    const { toJSON } = render(
      <SliderStep
        clockType={12}
        index={3}
        isLast
        isObservation={false}
        item={3600}
        sliderWidth={320}
        step={900}
        stepWidth={20}
      />
    );

    const tree = toJSON() as any;
    expect(tree.children[0]).toBeTruthy();
    const containerStyles = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedContainerStyle = Object.assign({}, ...containerStyles);
    expect(mergedContainerStyle.marginRight).toBe(159);
  });
});
