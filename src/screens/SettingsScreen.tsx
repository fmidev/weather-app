import React from 'react';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

import { setItem, LOCALE } from '../utils/async_storage';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation('settings');

  const onChangeLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    try {
      await setItem(LOCALE, lang);
    } catch (error) {
      console.error('error:', error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer} testID="settings_language_header">
        <Text style={styles.title}>{`${t('settings:language')}`}</Text>
      </View>
      <View>
        <View style={[styles.rowWrapper, styles.withBorderBottom]}>
          <TouchableOpacity
            onPress={() => onChangeLanguage('fi')}
            delayPressIn={100}
            disabled={i18n.language === 'fi'}>
            <View style={styles.row}>
              <Text style={styles.text}>{`${t('settings:fi')}`}</Text>
              {i18n.language === 'fi' && <Icon name="checkmark" size={22} />}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.rowWrapper}>
          <TouchableOpacity
            onPress={() => onChangeLanguage('en')}
            delayPressIn={100}
            disabled={i18n.language === 'en'}>
            <View style={styles.row}>
              <Text style={styles.text}>{`${t('settings:en')}`}</Text>
              {i18n.language === 'en' && <Icon name="checkmark" size={22} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowWrapper: {
    marginHorizontal: 20,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  text: {
    fontSize: 15,
  },
});

export default SettingsScreen;
