import React, { useState } from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import Permissions, { PERMISSIONS } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

import { SetupStackParamList } from '@navigators/types';
import Text from '@components/common/AppText';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { GRAY_1, CustomTheme } from '@assets/colors';
import { useOrientation } from '@utils/hooks';
import { Config } from '@config';
import { providerLogos } from '@assets/images';

type SetupScreenProps = {
  setUpDone: () => void;
  navigation: StackNavigationProp<SetupStackParamList, 'SetupScreen'>;
  termsOfUseChanged: boolean;
};

const SetupScreen: React.FC<SetupScreenProps> = ({
  navigation,
  setUpDone,
  termsOfUseChanged
}) => {
  const { languageSpecificLogo } = Config.get('onboardingWizard');
  const { t, i18n } = useTranslation('setUp');
  const { colors, dark } = useTheme() as CustomTheme;
  const [didViewTerms, setDidViewTerms] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const isLandscape = useOrientation();
  const insets = useSafeAreaInsets();
  const showLanguageSpecificLogo = languageSpecificLogo && providerLogos[i18n.language];

  const rowBottomPosition = Math.round(insets.bottom) + 16;

  const requestLocationPermissions = () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    Permissions.request(permission)
      .then((result) => {
        console.log('yes to location', result);
        setUpDone();
      })
      .catch((e) => console.error(e));
  };

  const acceptTermsOfUse = () => {
    if (termsOfUseChanged) {
      setUpDone()
    } else {
      setPageIndex(1);
    }
  };

  const PermissionComponent: React.FC<{
    title: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText?: string;
    primaryButtonFirst?: boolean;
    onPrimaryButtonPress: () => void;
    onSecondaryButtonPress?: () => void;
    primaryButtonDisabled: boolean;
    primaryButtonTestID?: string;
    secondaryButtonTestID?: string;
  }> = ({
    title,
    description,
    primaryButtonText,
    secondaryButtonText,
    primaryButtonFirst,
    onPrimaryButtonPress,
    onSecondaryButtonPress,
    primaryButtonDisabled,
    primaryButtonTestID,
    secondaryButtonTestID,
  }) => (
    <View
      style={[
        styles.permissionContainer,
        { backgroundColor: colors.background, shadowColor: colors.shadow },
      ]}>
      <Text
        testID="setup_title_text"
        style={[styles.title, { color: colors.text }]}
        accessibilityRole="header">
        {title}
      </Text>
      <Text
        testID="setup_description_text"
        style={[styles.textNormal, { color: colors.hourListText }]}>
        {description}
      </Text>
      {!primaryButtonFirst ? (
        <>
          {secondaryButtonText && (
            <AccessibleTouchableOpacity
              testID={secondaryButtonTestID}
              accessibilityRole="button"
              onPress={onSecondaryButtonPress}
              style={styles.marginBottom20}>
              <View
                style={[
                  styles.secondaryButton,
                  { borderBottomColor: colors.primary },
                ]}>
                <Text
                  style={[styles.textHighlight, { color: colors.text }]}>
                  {secondaryButtonText}
                </Text>
              </View>
            </AccessibleTouchableOpacity>
          )}
          <AccessibleTouchableOpacity
            testID={primaryButtonTestID}
            onPress={onPrimaryButtonPress}
            accessibilityRole="button"
            disabled={primaryButtonDisabled}
            style={
              secondaryButtonText
                ? styles.marginBottom40
                : styles.marginBottom20
            }>
            <View
              style={[
                styles.button,
                { backgroundColor: colors.text },
                primaryButtonDisabled && styles.disabled,
              ]}>
              <View style={styles.textContainer}>
                <Text style={[styles.text, { color: colors.headerBackground }]}>
                  {primaryButtonText}
                </Text>
              </View>
            </View>
          </AccessibleTouchableOpacity>
        </>
      ) : (
        <>
          <AccessibleTouchableOpacity
            testID={primaryButtonTestID}
            onPress={onPrimaryButtonPress}
            accessibilityRole="button"
            disabled={primaryButtonDisabled}
            style={
              secondaryButtonText
                ? styles.marginBottom20
                : styles.marginBottom40
            }>
            <View
              style={[
                styles.button,
                { backgroundColor: colors.text },
                primaryButtonDisabled && styles.disabled,
              ]}>
              <View style={styles.textContainer}>
                <Text style={[styles.text, { color: colors.headerBackground }]}>
                  {primaryButtonText}
                </Text>
              </View>
            </View>
          </AccessibleTouchableOpacity>
          {secondaryButtonText && (
            <AccessibleTouchableOpacity
              testID={secondaryButtonTestID}
              accessibilityRole="button"
              onPress={onSecondaryButtonPress}
              style={styles.marginBottom40}>
              <View
                style={[
                  styles.secondaryButton,
                  { borderBottomColor: colors.primary },
                ]}>
                <Text
                  style={[styles.textHighlight, { color: colors.text }]}>
                  {secondaryButtonText}
                </Text>
              </View>
            </AccessibleTouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.imageBackground}
        resizeMode="contain"
        source={
          dark
            ? require('../assets/images/weather-background-dark.png')
            : require('../assets/images/weather-background-light.png')
        }>
        <Image
          source={
            dark
              ? showLanguageSpecificLogo ? providerLogos[i18n.language].dark : require(`../assets/images/provider-logo-dark.png`)
              : showLanguageSpecificLogo ? providerLogos[i18n.language].light : require(`../assets/images/provider-logo-light.png`)
          }
          resizeMode="contain"
          style={styles.logo}
        />
      </ImageBackground>
      <View
        style={[
          styles.innerContainer,
          isLandscape && styles.innerContainerLandscape,
        ]}>
        {pageIndex === 0 && (
          <PermissionComponent
            title={ termsOfUseChanged ? t('termsAndConditionsChanged') : t('termsAndConditions')}
            description={t('termsAndConditionsDescription')}
            primaryButtonText={t('accept')}
            secondaryButtonText={t('termsAndConditions')}
            onPrimaryButtonPress={acceptTermsOfUse}
            onSecondaryButtonPress={() => {
              if (!didViewTerms) setDidViewTerms(true);
              navigation.navigate('TermsAndConditions');
            }}
            primaryButtonDisabled={!didViewTerms}
            primaryButtonTestID="setup_primary_button"
            secondaryButtonTestID="setup_secondary_button"
          />
        )}
        {pageIndex === 1 && (
          <PermissionComponent
            title={t('location')}
            description={t('locationDescription')}
            primaryButtonText={t('showBuiltInLocationPermissionQuestion')}
            onPrimaryButtonPress={requestLocationPermissions}
            primaryButtonDisabled={false}
            primaryButtonFirst
            primaryButtonTestID="setup_primary_button"
            secondaryButtonTestID="setup_secondary_button"
          />
        )}
      </View>
      { !termsOfUseChanged && (
        <View
          testID="setup_pagination"
          style={[styles.row, styles.center, styles.height10, { bottom: rowBottomPosition }]}>
          <View
            testID="setup_pagination_0"
            style={[
              styles.pagination,
              styles.marginRight,
              { backgroundColor: pageIndex === 0 ? colors.primary : GRAY_1 },
            ]}
          />
          <View
            testID="setup_pagination_1"
            style={[
              styles.pagination,
              { backgroundColor: pageIndex === 1 ? colors.primary : GRAY_1 },
            ]}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    top: 40,
    left: 40,
    height: 40,
    width: 190,
  },
  innerContainer: {
    position: 'absolute',
    bottom: 72,
    maxWidth: 600,
    alignSelf: 'center',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  innerContainerLandscape: {
    bottom: 25,
  },
  permissionContainer: {
    width: '100%',
    minHeight: 274,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowOffset: {
      width: -2,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    marginTop: 30,
    alignSelf: 'center',
    fontFamily: 'Roboto-Bold',
  },
  textNormal: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto-Regular',
  },
  textHighlight: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  secondaryButton: {
    borderBottomWidth: 2,
    padding: 4,
  },
  button: {
    minWidth: 120,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  textContainer: {
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
  },
  pagination: {
    height: 10,
    width: 10,
    borderRadius: 50,
  },
  marginRight: {
    marginRight: 8,
  },
  height10: {
    height: 10,
  },
  row: {
    position: 'absolute',
    bottom: 32,
    width: '100%',
    flexDirection: 'row',
  },
  center: {
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  marginBottom20: {
    marginBottom: 20,
  },
  marginBottom40: {
    marginBottom: 40,
  },
});

export default SetupScreen;
