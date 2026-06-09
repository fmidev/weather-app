import React, { useCallback, useState, useRef } from 'react';
import {
  ImageBackground,
  Image,
  StyleSheet,
  View,
  findNodeHandle,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Text as RNText } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { SetupStackParamList } from '@navigators/stacks/types';

import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { GRAY_1, CustomTheme } from '@assets/colors';
import { useOrientation } from '@utils/hooks';
import { Config } from '@config';
import { providerLogos } from '@assets/images';
import { LOCALE, setItem } from '@utils/async_storage';
import { initMatomo, trackMatomoEvent } from '@utils/matomo';
import { REGULAR_FONT, MEDIUM_FONT, BOLD_FONT } from '@assets/constants';

type OnboardingScreenProps = {
  navigation: StackNavigationProp<SetupStackParamList, 'Onboarding'>;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { languageSpecificLogo, backgroundImageProperties } = Config.get('onboardingWizard');
  const { languages } = Config.get('settings');
  const { t, i18n } = useTranslation('onboarding');
  const { colors, dark } = useTheme() as CustomTheme;
  const [pageIndex, setPageIndex] = useState<number>(0);
  const titleRef = useRef<RNText>(null);
  const isLandscape = useOrientation();
  const insets = useSafeAreaInsets();

  const rowBottomPosition = Math.round(insets.bottom) + 16;
  const skipButtonBottomPosition = Math.round(insets.bottom);

  const showLanguageSpecificLogo = languageSpecificLogo && providerLogos[i18n.language];

  const changeLanguage = useCallback(async (language: string): Promise<void> => {
    if (i18n.language === language) {
      return;
    }

    await i18n.changeLanguage(language);
    initMatomo(); // re-init matomo to use correct siteId
    trackMatomoEvent('User action', 'Onboarding', `Select language - ${language}`);

    try {
      await setItem(LOCALE, language);
    } catch (error) {
      console.error('error:', error);
    }
  }, [i18n]);

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

  const currentInfo = onboardingInfo[pageIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.imageBackground}
        resizeMode="contain"
        source={
          backgroundImageProperties ? undefined :
            dark ? require(`../assets/images/weather-background-dark.png`) : require(`../assets/images/weather-background-light.png`)
        }>
        { backgroundImageProperties &&
          <Image
            style={[
              styles.customBackgroundImage,
              {
                top: backgroundImageProperties?.top ?? 0,
                height: backgroundImageProperties?.height ?? '100%'
              }
            ]}
            resizeMode="contain"
            source={
              dark
                ? require(`../assets/images/weather-background-dark.png`)
                : require(`../assets/images/weather-background-light.png`)
            }
          />
        }
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
            <Icon
              name={currentInfo.icon}
              width={32}
              height={32}
              maxFontSizeMultiplier={1.5}
              color={colors.text}
            />
          </View>
          <Text
            testID="onboarding_title_text"
            ref={titleRef}
            style={[styles.title, { color: colors.text }]}
            accessibilityRole="header"
            accessibilityLabel={`${t('step', {
              current: pageIndex + 1,
              total: 4,
            })}: ${currentInfo.title}`}>
            {currentInfo.title}
          </Text>
          <Text
            testID="onboarding_description_text"
            style={[styles.textNormal, { color: colors.hourListText }]}>
            {currentInfo.description}
          </Text>
          {pageIndex === 0 && (
            <>
              <Text
                testID="onboarding_language_title"
                accessibilityRole="header"
                style={[styles.languageTitle, { color: colors.text }]}>
                {t('language')}
              </Text>
              <View
                testID="onboarding_language_options"
                style={styles.languageOptions}>
                {languages.map((language) => {
                  const selected = i18n.language === language;
                  return (
                    <AccessibleTouchableOpacity
                      key={language}
                      testID={`onboarding_set_language_${language}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => changeLanguage(language)}
                      style={[
                        styles.languageButton,
                        {
                          backgroundColor: selected
                            ? colors.inputBackground
                            : colors.background,
                          borderColor: selected ? colors.text : colors.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.languageButtonText,
                          { color: colors.text },
                        ]}>
                        {t(language)}
                      </Text>
                    </AccessibleTouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
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
      </View>
      <View
        testID="onboarding_pagination"
        style={[styles.row, styles.center, styles.height10, { bottom: rowBottomPosition }]}>
        <View
          testID="onboarding_pagination_0"
          style={[
            styles.pagination,
            styles.marginRight,
            { backgroundColor: pageIndex === 0 ? colors.text : GRAY_1 },
          ]}
        />
        <View
          testID="onboarding_pagination_1"
          style={[
            styles.pagination,
            styles.marginRight,
            { backgroundColor: pageIndex === 1 ? colors.text : GRAY_1 },
          ]}
        />
        <View
          testID="onboarding_pagination_2"
          style={[
            styles.pagination,
            styles.marginRight,
            { backgroundColor: pageIndex === 2 ? colors.text : GRAY_1 },
          ]}
        />
        <View
          testID="onboarding_pagination_3"
          style={[
            styles.pagination,
            { backgroundColor: pageIndex === 3 ? colors.text : GRAY_1 },
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
    fontFamily: BOLD_FONT,
    fontWeight: 'bold',
  },
  textNormal: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: REGULAR_FONT,
  },
  languageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  languageTitle: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  languageButton: {
    borderRadius: 20,
    borderWidth: 2,
    marginHorizontal: 4,
    marginVertical: 4,
    minHeight: 40,
    minWidth: 88,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  languageButtonText: {
    fontSize: 16,
    fontFamily: MEDIUM_FONT,
    textAlign: 'center',
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
    fontFamily: MEDIUM_FONT,
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
  customBackgroundImage: {
    position: 'absolute',
    top: 120,
    width: '100%',
    height: 200
  }
});

export default OnboardingScreen;
