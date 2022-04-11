import React, { useState } from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { SetupStackParamList } from '@navigators/types';

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { GRAY_1, CustomTheme } from '@utils/colors';

type OnboardingScreenProps = {
  navigation: StackNavigationProp<SetupStackParamList, 'Onboarding'>;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('onboarding');
  const { colors, dark } = useTheme() as CustomTheme;
  const [pageIndex, setPageIndex] = useState<number>(0);

  const onboardingInfo = [
    {
      icon: 'weather',
      title: t('weatherTitle'),
      description: t('weatherDescription'),
    },
    {
      icon: 'map',
      title: t('mapTitle'),
      description: t('mapDescription'),
    },
    {
      icon: 'warnings',
      title: t('warningsTitle'),
      description: t('warningsDescription'),
    },
    {
      icon: 'settings',
      title: t('customizeTitle'),
      description: t('customizeDescription'),
    },
  ];

  const InfoComponent: React.FC<{
    icon: string;
    title: string;
    description: string;
  }> = ({ icon, title, description }) => (
    <View
      style={[
        styles.infoContainer,
        { backgroundColor: colors.background, shadowColor: colors.shadow },
      ]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.background, shadowColor: colors.shadow },
        ]}>
        <Icon name={icon} width={32} height={32} color={colors.primaryText} />
      </View>
      <Text
        style={[styles.title, { color: colors.primaryText }]}
        accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.textNormal, { color: colors.hourListText }]}>
        {description}
      </Text>
      <AccessibleTouchableOpacity
        accessibilityRole="button"
        style={styles.buttonContainer}
        onPress={() => {
          if (pageIndex === onboardingInfo.length - 1) {
            navigation.navigate('SetupScreen');
          } else setPageIndex((index) => index + 1);
        }}>
        <View style={[styles.button, { borderColor: colors.primaryText }]}>
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: colors.primaryText }]}>
              {t('next')}
            </Text>
          </View>
        </View>
      </AccessibleTouchableOpacity>
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
      <View style={styles.innerContainer}>
        <InfoComponent
          icon={onboardingInfo[pageIndex].icon}
          title={onboardingInfo[pageIndex].title}
          description={onboardingInfo[pageIndex].description}
        />
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
            styles.marginRight,

            { backgroundColor: pageIndex === 1 ? colors.primary : GRAY_1 },
          ]}
        />
        <View
          style={[
            styles.pagination,
            styles.marginRight,

            { backgroundColor: pageIndex === 2 ? colors.primary : GRAY_1 },
          ]}
        />
        <View
          style={[
            styles.pagination,
            { backgroundColor: pageIndex === 3 ? colors.primary : GRAY_1 },
          ]}
        />
      </View>
      <AccessibleTouchableOpacity
        accessibilityRole="button"
        style={styles.skipButton}
        onPress={() => navigation.navigate('SetupScreen')}>
        <Text style={[styles.text, { color: colors.primaryText }]}>
          {t('skip')}
        </Text>
      </AccessibleTouchableOpacity>
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
    right: 0,
    left: 0,
    alignSelf: 'center',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  infoContainer: {
    width: '100%',
    height: 274,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 10,
  },
  iconContainer: {
    position: 'absolute',
    top: -40,
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    marginTop: 60,
    alignSelf: 'center',
    fontFamily: 'Roboto-Bold',
  },
  textNormal: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto-Regular',
  },
  button: {
    minWidth: 120,
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 25,
    borderWidth: 2,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
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
  skipButton: { position: 'absolute', right: 40, bottom: 16 },
});

export default OnboardingScreen;
