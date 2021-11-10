import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';
import { CustomTheme } from '@utils/colors';
import { Location } from '@store/location/types';

type ClearProps =
  | { clearTitle?: undefined; onClear?: never }
  | { clearTitle?: string; onClear: () => void };
// TODO: add accessibility labels
type AreaListProps = ClearProps & {
  elements: Location[];
  title: string;
  onSelect: (element: Location) => void;
  onIconPress: (element: Location) => void;
  iconNameGetter?: (element: Location) => string;
  iconName?: string;
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
}) => {
  const { t } = useTranslation('searchScreen');
  const { colors } = useTheme() as CustomTheme;
  const iconRight = (location: Location) => {
    if (iconName) return iconName;
    if (iconNameGetter) return iconNameGetter(location);
    return 'star-unselected';
  };

  return (
    <View style={styles.listWrapper}>
      <View
        style={[
          styles.resultsHeader,
          styles.withBorderBottom,
          styles.listItem,
          { borderBottomColor: colors.border },
        ]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.title, { color: colors.secondaryText }]}>
          {t('remember')}
        </Text>
      </View>

      <View>
        {elements.map((element: Location) => (
          <View
            key={`${title}-${element.id}`}
            style={[
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <View style={styles.listItem}>
              <TouchableOpacity
                onPress={() => onSelect(element)}
                style={styles.locationContainer}>
                <View style={styles.listItem}>
                  <Text style={[styles.resultText, { color: colors.text }]}>
                    {element.area && element.area !== element.name
                      ? `${element.name}, ${element.area}`
                      : element.name}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onIconPress(element)}>
                <View
                  style={[
                    styles.actionButtonContainer,
                    { borderLeftColor: colors.border },
                  ]}>
                  <Icon
                    name={iconRight(element)}
                    size={20}
                    style={[styles.iconStyle, { color: colors.text }]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {clearTitle && onClear && (
        <View style={[styles.resultsHeader, styles.clearRow]}>
          <TouchableOpacity onPress={onClear}>
            <Text style={[styles.title, { color: colors.text }]}>
              {clearTitle}
            </Text>
          </TouchableOpacity>
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
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
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
    borderLeftWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  clearRow: { flexDirection: 'row', justifyContent: 'flex-end' },
});

export default AreaList;
