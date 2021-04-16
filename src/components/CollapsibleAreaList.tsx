import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';

import { Location } from '../store/settings/types';

import IconButton from './IconButton';

import {
  PRIMARY_BLUE,
  WHITE,
  VERY_LIGHT_BLUE,
  GRAYISH_BLUE,
} from '../utils/colors';

type ToggleProps =
  | { open: true; onToggle?: never }
  | { open: boolean; onToggle: () => void };

type CollapsibleAreaListProps = ToggleProps & {
  elements: Location[];
  title: string;
  onSelect: (element: Location) => void;
  onIconPress: (element: Location) => void;
  iconNameGetter?: (element: Location) => string;
  iconName?: string;
};

const CollapsibleAreaList: React.FC<CollapsibleAreaListProps> = ({
  elements,
  open,
  onToggle,
  title,
  onSelect,
  onIconPress,
  iconNameGetter,
  iconName,
}) => {
  const iconRight = (location: Location) => {
    if (iconName) return iconName;
    if (iconNameGetter) return iconNameGetter(location);
    return 'add-outline';
  };

  const isPrimary = (location: Location) =>
    iconRight(location) === 'add-outline';

  return (
    <>
      <TouchableOpacity onPress={onToggle}>
        <View
          style={[
            styles.resultsHeader,
            styles.withBorderBottom,
            styles.listItem,
          ]}>
          <Text style={styles.title}>{title}</Text>
          {open ? (
            <IconButton
              icon="chevron-up"
              style={styles.iconStyle}
              backgroundColor={WHITE}
              iconColor={PRIMARY_BLUE}
              iconSize={20}
            />
          ) : (
            <IconButton
              icon="chevron-down"
              style={styles.iconStyle}
              backgroundColor={WHITE}
              iconColor={PRIMARY_BLUE}
              iconSize={20}
            />
          )}
        </View>
      </TouchableOpacity>
      {open && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {elements.map((element: Location, i: number) => (
            <View
              key={element.id}
              style={i + 1 !== elements.length && [styles.withBorderBottom]}>
              <View style={styles.listItem}>
                <TouchableOpacity onPress={() => onSelect(element)}>
                  <View style={styles.listItem}>
                    <Text style={styles.resultText}>
                      {element.area && element.area !== element.name
                        ? `${element.name}, ${element.area}`
                        : element.name}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onIconPress(element)}>
                  <View style={styles.actionButtonContainer}>
                    <IconButton
                      icon={iconRight(element)}
                      style={styles.iconStyle}
                      backgroundColor={
                        isPrimary(element) ? PRIMARY_BLUE : GRAYISH_BLUE
                      }
                      iconColor={isPrimary(element) ? WHITE : PRIMARY_BLUE}
                      iconSize={20}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  resultsHeader: {
    height: 48,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: WHITE,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
    borderColor: VERY_LIGHT_BLUE,
  },
  resultText: {
    fontSize: 15,
    height: 18,
    color: PRIMARY_BLUE,
    marginLeft: 16,
  },
  actionButtonContainer: {
    width: 50,
    borderLeftWidth: 1,
    borderColor: VERY_LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentListContainer: {
    maxHeight: '45%',
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
});

export default CollapsibleAreaList;
