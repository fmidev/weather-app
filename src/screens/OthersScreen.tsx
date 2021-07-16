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
import { useTranslation } from 'react-i18next';
import { OthersStackParamList } from '../navigators/types';

import Icon from '../components/Icon';

interface Props {
  navigation: StackNavigationProp<OthersStackParamList, 'Others'>;
}

const OthersScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation('navigation');
  return (
    <SafeAreaView>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.rowWrapper, styles.withBorderBottom]}>
          <TouchableOpacity
            delayPressIn={100}
            onPress={() => navigation.navigate('Symbols')}
            testID="navigation_symbols">
            <View style={styles.row}>
              <Text style={styles.text}>{`${t('navigation:symbols')}`}</Text>
              <Icon name="chevron-forward" size={22} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={[styles.rowWrapper, styles.withBorderBottom]}>
          <TouchableOpacity
            delayPressIn={100}
            onPress={() => navigation.navigate('Settings')}
            testID="navigation_settings">
            <View style={styles.row}>
              <Text style={styles.text}>{`${t('navigation:settings')}`}</Text>
              <Icon name="chevron-forward" size={22} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={[styles.rowWrapper, styles.withBorderBottom]}>
          <TouchableOpacity
            delayPressIn={100}
            onPress={() => navigation.navigate('Notifications')}
            testID="navigation_notifications">
            <View style={styles.row}>
              <Text style={styles.text}>{`${t(
                'navigation:notifications'
              )}`}</Text>
              <Icon name="chevron-forward" size={22} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.rowWrapper}>
          <TouchableOpacity
            delayPressIn={100}
            onPress={() => navigation.navigate('About')}
            testID="navigation_about">
            <View style={styles.row}>
              <Text style={styles.text}>{`${t('navigation:about')}`}</Text>
              <Icon name="chevron-forward" size={22} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  text: {
    fontSize: 15,
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
