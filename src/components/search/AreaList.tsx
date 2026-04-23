import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme, GRAY_1 } from '@assets/colors';
import { Location } from '@store/location/types';

type ClearProps =
  | { clearTitle?: undefined; onClear?: never }
  | { clearTitle?: string; onClear: () => void };

type AreaListProps = ClearProps & {
  elements: Location[];
  title: string;
  onSelect: (element: Location) => void;
  onIconPress: (element: Location) => void;
  iconNameGetter?: (element: Location) => string;
  iconName?: string;
  testID?: string;
};

const AreaList: React.FC<AreaListProps> = ({
  elements,
  title,
  onSelect,
  onIconPress,
  iconNameGetter,
  iconName,
  clearTitle,
  onClear,
  testID,
}) => {
  const { t } = useTranslation('searchScreen');
  const { colors } = useTheme() as CustomTheme;
  const iconRight = (location: Location) => {
    if (iconName) return iconName;
    if (iconNameGetter) return iconNameGetter(location);
    return 'star-unselected';
  };

  return (
    <View testID={testID || undefined} style={styles.listWrapper}>
      <View
        style={[
          styles.resultsHeader,
          styles.withBorderBottom,
          styles.listHeader,
          styles.listItem,
          { borderBottomColor: colors.border },
        ]}>
          <View style={styles.shrink}>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: colors.text }]}
            >
              {title}
            </Text>
          </View>
          <View style={styles.remember}>
            <Text
              accessibilityRole="header"
              style={[styles.regular, { color: colors.hourListText }]}>
              {t('remember')}
            </Text>
          </View>
      </View>

      <View>
        {elements.map((element: Location) => {
          const name =
            element.area && element.area !== element.name
              ? `${element.name}, ${element.area}`
              : element.name;
          return (
            <View
              key={`${title}-${element.id}`}
              style={[
                styles.withBorderBottom,
                { borderBottomColor: colors.border },
              ]}>
              <View style={styles.listItem}>
                <AccessibleTouchableOpacity
                  accessibilityRole="button"
                  accessibilityHint={t('choose')}
                  onPress={() => onSelect(element)}
                  style={styles.locationContainer}>
                  <View style={styles.listItem}>
                    {element.isGeolocation && (
                      <Icon
                        name="map-marker"
                        style={[
                          styles.listLocationIcon,
                          { color: colors.text },
                        ]}
                        height={12}
                      />
                    )}
                    <Text
                      testID="search_result_text"
                      style={[styles.resultText, { color: colors.text }]}>
                      {name}
                    </Text>
                  </View>
                </AccessibleTouchableOpacity>
                <AccessibleTouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    iconRight(element) === 'star-unselected'
                      ? t('addToFavorites', { location: name })
                      : t('removeFromFavorites', { location: name })
                  }
                  onPress={() => onIconPress(element)}>
                  <View
                    style={[
                      styles.actionButtonContainer,
                      { borderLeftColor: colors.border },
                    ]}>
                    <Icon
                      name={iconRight(element)}
                      size={20}
                      style={[
                        styles.iconStyle,
                        {
                          color:
                            iconRight(element) === 'star-unselected'
                              ? GRAY_1
                              : colors.primary,
                        },
                      ]}
                    />
                  </View>
                </AccessibleTouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {clearTitle && onClear && (
        <View style={[styles.resultsHeader, styles.clearRow]}>
          <AccessibleTouchableOpacity
            onPress={onClear}
            accessibilityRole="button">
            <Text style={[styles.title, { color: colors.text }]}>
              {clearTitle}
            </Text>
          </AccessibleTouchableOpacity>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  listWrapper: {
    flexShrink: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 2,
    fontFamily: 'Roboto-Bold',
    flex: 1,
    flexDirection: 'row',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  regular: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    textAlign: 'right',
  },
  listHeader: {
    justifyContent: 'space-between',
  },
  listItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  listLocationIcon: {
    marginLeft: -5,
    marginRight: -20,
  },
  locationContainer: {
    flex: 1,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  resultText: {
    fontSize: 16,
    marginLeft: 16,
    fontFamily: 'Roboto-Regular',
  },
  actionButtonContainer: {
    width: 50,
    minHeight: 36,
    borderLeftWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  shrink: {
    flexShrink: 1
  },
  remember: {
    flexGrow: 1,
  },
  clearRow: { flexDirection: 'row', justifyContent: 'flex-end' },
});

export default AreaList;
