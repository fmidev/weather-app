import React from 'react';
import { processColor, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import type { CustomTheme } from '@assets/colors';

type Props = {
  edges: { left: boolean; right: boolean };
  testIDPrefix: string;
};

const HorizontalScrollFades: React.FC<Props> = ({ edges, testIDPrefix }) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const backgroundColor = processColor(colors.background);
  const backgroundRgb =
    typeof backgroundColor === 'number'
      ? // Decode the packed native color so the fade keeps the same RGB values.
        // eslint-disable-next-line no-bitwise
        `${(backgroundColor >>> 16) & 255}, ${(backgroundColor >>> 8) & 255}, ${backgroundColor & 255}`
      : undefined;
  const transparentBackground = backgroundRgb
    ? `rgba(${backgroundRgb}, 0)`
    : 'transparent';
  const fadeColors = dark
    ? [
        colors.background,
        backgroundRgb ? `rgba(${backgroundRgb}, 0.65)` : colors.background,
        transparentBackground,
      ]
    : [colors.background, transparentBackground];

  return (
    <>
      {edges.left && (
        <LinearGradient
          testID={`${testIDPrefix}-left-fade`}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          colors={fadeColors}
          locations={dark ? [0, 0.45, 1] : undefined}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.scrollFade,
            dark && styles.darkScrollFade,
            styles.leftFade,
          ]}
        />
      )}
      {edges.right && (
        <LinearGradient
          testID={`${testIDPrefix}-right-fade`}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          colors={[...fadeColors].reverse()}
          locations={dark ? [0, 0.55, 1] : undefined}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.scrollFade,
            dark && styles.darkScrollFade,
            styles.rightFade,
          ]}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30,
  },
  darkScrollFade: {
    width: 40,
  },
  leftFade: {
    left: 0,
  },
  rightFade: {
    right: 0,
  },
});

export default HorizontalScrollFades;
