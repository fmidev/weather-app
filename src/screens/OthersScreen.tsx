import React from 'react';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { OthersStackParamList } from '../navigators/types';

import Icon from '../components/Icon';

interface Props {
  navigation: StackNavigationProp<OthersStackParamList, 'Others'>;
}

const OthersScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation('navigation');
  const { colors } = useTheme();
  return (
    <SafeAreaView>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.rowWrapper,
            styles.withBorderBottom,
            { borderBottomColor: colors.border },
          ]}>
          <TouchableOpacity
            delayPressIn={100}
            onPress={() => navigation.navigate('Symbols')}
            testID="navigation_symbols">
            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>{`${t(
                'navigation:symbols'
              )}`}</Text>
              <Icon
                name="arrow-right"
                width={22}
                height={22}
                style={{ color: colors.text }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.rowWrapper,
            styles.withBorderBottom,
            { borderBottomColor: colors.border },
          ]}>
          <TouchableOpacity
            delayPressIn={100}
            onPress={() => navigation.navigate('Settings')}
            testID="navigation_settings">
            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>{`${t(
                'navigation:settings'
              )}`}</Text>
              <Icon
                name="arrow-right"
                width={22}
                height={22}
                style={{ color: colors.text }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.rowWrapper,
            styles.withBorderBottom,
            { borderBottomColor: colors.border },
          ]}>
          <TouchableOpacity
            delayPressIn={100}
            onPress={() => navigation.navigate('Notifications')}
            testID="navigation_notifications">
            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>{`${t(
                'navigation:notifications'
              )}`}</Text>
              <Icon
                name="arrow-right"
                width={22}
                height={22}
                style={{ color: colors.text }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.rowWrapper}>
          <TouchableOpacity
            delayPressIn={100}
            onPress={() => navigation.navigate('About')}
            testID="navigation_about">
            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>{`${t(
                'navigation:about'
              )}`}</Text>
              <Icon
                name="arrow-right"
                width={22}
                height={22}
                style={{ color: colors.text }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  rowWrapper: {
    marginHorizontal: 20,
  },
  withBorderBottom: {
    borderBottomWidth: 2,
  },
  scrollContainer: {
    minHeight: '100%',
  },
});

export default OthersScreen;
