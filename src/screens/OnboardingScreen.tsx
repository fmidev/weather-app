import React, { useState, useRef } from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  findNodeHandle,
  AccessibilityInfo,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

import { SetupStackParamList } from '@navigators/types';

import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { GRAY_1, CustomTheme } from '@assets/colors';
import { useOrientation } from '@utils/hooks';
import { Config } from '@config';
import { providerLogos } from '@assets/images';

type OnboardingScreenProps = {
  navigation: StackNavigationProp<SetupStackParamList, 'Onboarding'>;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { languageSpecificLogo } = Config.get('onboardingWizard');
  const { t, i18n } = useTranslation('onboarding');
  const { colors, dark } = useTheme() as CustomTheme;
  const [pageIndex, setPageIndex] = useState<number>(0);
  const titleRef = useRef<Text>(null);
  const isLandscape = useOrientation();
  const insets = useSafeAreaInsets();

  const rowBottomPosition = Math.round(insets.bottom) + 16;
  const skipButtonBottomPosition = Math.round(insets.bottom);

  const showLanguageSpecificLogo = languageSpecificLogo && providerLogos[i18n.language];

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

  const handlePress = () => {
    if (pageIndex === onboardingInfo.length - 1) {
      navigation.navigate('SetupScreen');
    } else {
      if (titleRef && titleRef.current) {
        const reactTag = findNodeHandle(titleRef.current);
        if (reactTag) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      }
      setPageIndex((index) => index + 1);
    }
  };

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
        testID="onboarding_info_icon_container"
        style={[
          styles.iconContainer,
          { backgroundColor: colors.background, shadowColor: colors.shadow },
        ]}>
        <Icon name={icon} width={32} height={32} color={colors.text} />
      </View>
      <Text
        testID="onboarding_title_text"
        ref={titleRef}
        style={[styles.title, { color: colors.text }]}
        accessibilityRole="header"
        accessibilityLabel={`${t('step', {
          current: pageIndex + 1,
          total: 4,
        })}: ${title}`}>
        {title}
      </Text>
      <Text
        testID="onboarding_description_text"
        style={[styles.textNormal, { color: colors.hourListText }]}>
        {description}
      </Text>
      <AccessibleTouchableOpacity
        testID="onboarding_next_button"
        accessibilityRole="button"
        style={styles.buttonContainer}
        onPress={handlePress}>
        <View style={[styles.button, { borderColor: colors.text }]}>
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: colors.text }]}>
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
            ? require(`../assets/images/weather-background-dark.png`)
            : require(`../assets/images/weather-background-light.png`)
        }>
        <Image
          testID="onboarding_logo_image"
          source={
            dark
              ? showLanguageSpecificLogo? providerLogos[i18n.language].dark : require(`../assets/images/provider-logo-dark.png`)
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
        <InfoComponent
          icon={onboardingInfo[pageIndex].icon}
          title={onboardingInfo[pageIndex].title}
          description={onboardingInfo[pageIndex].description}
        />
      </View>
      <View
        testID="onboarding_pagination"
        style={[styles.row, styles.center, styles.height10, { bottom: rowBottomPosition }]}>
        <View
          testID="onboarding_pagination_0"
          style={[
            styles.pagination,
            styles.marginRight,

            { backgroundColor: pageIndex === 0 ? colors.primary : GRAY_1 },
          ]}
        />
        <View
          testID="onboarding_pagination_1"
          style={[
            styles.pagination,
            styles.marginRight,

            { backgroundColor: pageIndex === 1 ? colors.primary : GRAY_1 },
          ]}
        />
        <View
          testID="onboarding_pagination_2"
          style={[
            styles.pagination,
            styles.marginRight,

            { backgroundColor: pageIndex === 2 ? colors.primary : GRAY_1 },
          ]}
        />
        <View
          testID="onboarding_pagination_3"
          style={[
            styles.pagination,
            { backgroundColor: pageIndex === 3 ? colors.primary : GRAY_1 },
          ]}
        />
      </View>
      <AccessibleTouchableOpacity
        testID="onboarding_skip_button"
        accessibilityRole="button"
        style={[styles.skipButton, { bottom: skipButtonBottomPosition }]}
        onPress={() => navigation.navigate('SetupScreen')}>
        <Text style={[styles.text, { color: colors.text }]}>
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
    width: '100%',
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
  infoContainer: {
    width: '100%',
    minHeight: 274,
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
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
  },
  buttonContainer: {
    marginBottom: 40,
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
    alignSelf: 'center',
    flexDirection: 'row',
  },
  center: {
    justifyContent: 'center',
  },
  skipButton: {
    position: 'absolute',
    right: 40,
    bottom: 16,
  },
});

export default OnboardingScreen;
