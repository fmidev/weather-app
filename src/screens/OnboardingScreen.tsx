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

import {
  PRIMARY_BLUE,
  WHITE,
  SHADOW_LIGHT,
  GRAY_1,
  CustomTheme,
  SECONDARY_BLUE,
  SHADOW_LIGHT_DARKER,
} from '@utils/colors';

type OnboardingScreenProps = {
  navigation: StackNavigationProp<SetupStackParamList, 'Onboarding'>;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('onboarding');
  const { colors } = useTheme() as CustomTheme;
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
    <View style={styles.infoContainer}>
      <View style={styles.iconContainer}>
        <Icon name={icon} width={32} height={32} color={PRIMARY_BLUE} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
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
        <View style={styles.button}>
          <View style={styles.textContainer}>
            <Text style={styles.text}>{t('next')}</Text>
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
        source={require('../assets/images/weather-background-light.png')}>
        <Image
          source={require('../assets/images/fmi-logo-fi.png')}
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
            pageIndex === 0 ? styles.active : styles.inActive,
          ]}
        />
        <View
          style={[
            styles.pagination,
            styles.marginRight,
            pageIndex === 1 ? styles.active : styles.inActive,
          ]}
        />
        <View
          style={[
            styles.pagination,
            styles.marginRight,
            pageIndex === 2 ? styles.active : styles.inActive,
          ]}
        />
        <View
          style={[
            styles.pagination,
            pageIndex === 3 ? styles.active : styles.inActive,
          ]}
        />
      </View>
      <AccessibleTouchableOpacity
        accessibilityRole="button"
        style={styles.skipButton}
        onPress={() => navigation.navigate('SetupScreen')}>
        <Text style={styles.text}>{t('skip')}</Text>
      </AccessibleTouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
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
    backgroundColor: WHITE,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowOffset: {
      width: -2,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 3,
    shadowColor: SHADOW_LIGHT,
  },
  iconContainer: {
    position: 'absolute',
    top: -40,
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 50,
    shadowColor: SHADOW_LIGHT_DARKER,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  title: {
    color: PRIMARY_BLUE,
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
    borderColor: PRIMARY_BLUE,
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
    color: PRIMARY_BLUE,
    textAlign: 'center',
  },
  pagination: {
    height: 10,
    width: 10,
    borderRadius: 50,
  },
  active: {
    backgroundColor: SECONDARY_BLUE,
  },
  inActive: {
    backgroundColor: GRAY_1,
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
