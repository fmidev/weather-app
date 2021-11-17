import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';
import CloseButton from '@components/common/CloseButton';
import { GRAY_1, CustomTheme } from '@utils/colors';

type SearchInfoSheetProps = {
  onClose: () => void;
};

const SearchInfoBottomSheet: React.FC<SearchInfoSheetProps> = ({ onClose }) => {
  const { t } = useTranslation('searchScreen');
  const { colors } = useTheme() as CustomTheme;

  return (
    <View style={styles.sheetListContainer}>
      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={t('infoSheet.closeButtonAccessibilityLabel')}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={1} style={styles.innerContainer}>
          <View style={styles.sheetTitle}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('infoSheet.saveAndDeleteTitle')}
            </Text>
          </View>
          <View style={styles.row}>
            <Icon
              name="star-selected"
              width={24}
              height={24}
              style={{ color: colors.primary }}
            />
            <Text
              style={[
                styles.text,
                styles.withMarginLeft,
                { color: colors.hourListText },
              ]}>
              {t('infoSheet.savedLocation')}
            </Text>
          </View>
          <View style={styles.row}>
            <Icon
              name="star-unselected"
              width={24}
              height={24}
              style={{ color: GRAY_1 }}
            />
            <Text
              style={[
                styles.text,
                styles.withMarginLeft,
                { color: colors.hourListText },
              ]}>
              {t('infoSheet.unsavedLocation')}
            </Text>
          </View>
          <View style={styles.largeIconContainer}>
            <Icon name="info-save-location" />
          </View>
          <Text style={[styles.text, { color: colors.hourListText }]}>
            {t('infoSheet.saveHint')}
          </Text>
          <View style={styles.largeIconContainer}>
            <Icon name="info-delete-location" />
          </View>
          <Text style={[styles.text, { color: colors.hourListText }]}>
            {t('infoSheet.deleteHint')}
          </Text>
          <Text
            style={[
              styles.text,
              styles.withMarginTop,
              { color: colors.hourListText },
            ]}>
            {t('infoSheet.deleteElaboration')}
          </Text>
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
          <View style={styles.sheetTitle}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('infoSheet.locateTitle')}
            </Text>
          </View>
          <View style={styles.largeIconContainer}>
            <Icon name="info-locate" />
          </View>
          <Text style={[styles.text, { color: colors.hourListText }]}>
            {t('infoSheet.locateHint')}
          </Text>
          <Text
            style={[
              styles.text,
              styles.withMarginTop,
              { color: colors.hourListText },
            ]}>
            {t('infoSheet.locateElaboration')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetListContainer: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 20,
  },
  innerContainer: {
    marginBottom: 50,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  text: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
  },
  withMarginLeft: {
    marginLeft: 16,
  },
  withMarginTop: {
    marginTop: 24,
  },
  largeIconContainer: {
    marginTop: 32,
    marginBottom: 5,
    alignSelf: 'center',
  },
  separator: {
    width: '100%',
    height: 1,
    marginTop: 24,
    marginBottom: 24,
  },
});

export default SearchInfoBottomSheet;
