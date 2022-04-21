import React, { useState } from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
import Permissions, { PERMISSIONS } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { SetupStackParamList } from '@navigators/types';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { GRAY_1, CustomTheme } from '@utils/colors';
import { useOrientation } from '@utils/hooks';

type SetupScreenProps = {
  setUpDone: () => void;
  navigation: StackNavigationProp<SetupStackParamList, 'SetupScreen'>;
};

const SetupScreen: React.FC<SetupScreenProps> = ({ navigation, setUpDone }) => {
  const { t } = useTranslation('setUp');
  const { colors, dark } = useTheme() as CustomTheme;
  const [didViewTerms, setDidViewTerms] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const isLandscape = useOrientation();

  const requestLocationPermissions = () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_ALWAYS
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    Permissions.request(permission)
      .then((result) => {
        console.log('yes to location', result);
        setUpDone();
      })
      .catch((e) => console.error(e));
  };

  const PermissionComponent: React.FC<{
    title: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    primaryButtonFirst?: boolean;
    onPrimaryButtonPress: () => void;
    onSecondaryButtonPress: () => void;
    primaryButtonDisabled: boolean;
  }> = ({
    title,
    description,
    primaryButtonText,
    secondaryButtonText,
    primaryButtonFirst,
    onPrimaryButtonPress,
    onSecondaryButtonPress,
    primaryButtonDisabled,
  }) => (
    <View
      style={[
        styles.permissionContainer,
        { backgroundColor: colors.background, shadowColor: colors.shadow },
      ]}>
      <Text
        style={[styles.title, { color: colors.primaryText }]}
        accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.textNormal, { color: colors.hourListText }]}>
        {description}
      </Text>
      {!primaryButtonFirst ? (
        <>
          <AccessibleTouchableOpacity
            accessibilityRole="button"
            onPress={onSecondaryButtonPress}
            style={styles.marginBottom20}>
            <View
              style={[
                styles.secondaryButton,
                { borderBottomColor: colors.primary },
              ]}>
              <Text
                style={[styles.textHighlight, { color: colors.primaryText }]}>
                {secondaryButtonText}
              </Text>
            </View>
          </AccessibleTouchableOpacity>
          <AccessibleTouchableOpacity
            onPress={onPrimaryButtonPress}
            accessibilityRole="button"
            disabled={primaryButtonDisabled}
            style={styles.marginBottom40}>
            <View
              style={[
                styles.button,
                { backgroundColor: colors.primaryText },
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
            onPress={onPrimaryButtonPress}
            accessibilityRole="button"
            disabled={primaryButtonDisabled}
            style={styles.marginBottom20}>
            <View
              style={[
                styles.button,
                { backgroundColor: colors.primaryText },
                primaryButtonDisabled && styles.disabled,
              ]}>
              <View style={styles.textContainer}>
                <Text style={[styles.text, { color: colors.headerBackground }]}>
                  {primaryButtonText}
                </Text>
              </View>
            </View>
          </AccessibleTouchableOpacity>
          <AccessibleTouchableOpacity
            accessibilityRole="button"
            onPress={onSecondaryButtonPress}
            style={styles.marginBottom40}>
            <View
              style={[
                styles.secondaryButton,
                { borderBottomColor: colors.primary },
              ]}>
              <Text
                style={[styles.textHighlight, { color: colors.primaryText }]}>
                {secondaryButtonText}
              </Text>
            </View>
          </AccessibleTouchableOpacity>
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
              ? require('../assets/images/fmi-logo-dark.png')
              : require('../assets/images/fmi-logo-light.png')
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
            title={t('termsAndConditions')}
            description={t('termsAndConditionsDescription')}
            primaryButtonText={t('accept')}
            secondaryButtonText={t('termsAndConditions')}
            onPrimaryButtonPress={() => setPageIndex(1)}
            onSecondaryButtonPress={() => {
              if (!didViewTerms) setDidViewTerms(true);
              navigation.navigate('TermsAndConditions');
            }}
            primaryButtonDisabled={!didViewTerms}
          />
        )}
        {pageIndex === 1 && (
          <PermissionComponent
            title={t('location')}
            description={t('locationDescription')}
            primaryButtonText={t('acceptLocation')}
            secondaryButtonText={t('declineLocation')}
            onPrimaryButtonPress={requestLocationPermissions}
            onSecondaryButtonPress={setUpDone}
            primaryButtonDisabled={false}
            primaryButtonFirst
          />
        )}
      </View>
      <View style={[styles.row, styles.center, styles.height10]}>
        <View
          style={[
            styles.pagination,
            styles.marginRight,
            { backgroundColor: pageIndex === 0 ? colors.primary : GRAY_1 },
          ]}
        />
        <View
          style={[
            styles.pagination,
            { backgroundColor: pageIndex === 1 ? colors.primary : GRAY_1 },
          ]}
        />
      </View>
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
    position: 'relative',
    bottom: 10,
  },
  permissionContainer: {
    width: '100%',
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
    height: 44,
    borderRadius: 25,
  },
  textContainer: {
    height: '100%',
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
