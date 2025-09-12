import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  AccessibilityInfo,
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';

import Icon from '@assets/Icon';
import CloseButton from '@components/common/CloseButton';

import { MapStackParamList, WeatherStackParamList } from '@navigators/types';

import { State } from '@store/types';

import {
  selectRecent,
  selectFavorites,
  selectSearch,
  selectLoading,
} from '@store/location/selector';

import {
  addFavorite as addFavoriteAction,
  deleteFavorite as deleteFavoriteAction,
  deleteAllFavorites as deleteAllFavoritesAction,
  updateRecentSearches as updateRecentSearchesAction,
  deleteAllRecentSearches as deleteAllRecentSearchesAction,
  setCurrentLocation as setCurrentLocationAction,
  searchLocation as searchLocationAction,
  resetSearch as resetSearchAction,
  setLoading as setLoadingAction,
} from '@store/location/actions';
import { Location } from '@store/location/types';
import { setAnimateToArea as setAnimateToAreaAction } from '@store/map/actions';

import AreaList from '@components/search/AreaList';
import IconButton from '@components/common/IconButton';

import { getGeolocation } from '@utils/helpers';
import { CustomTheme } from '@assets/colors';
import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  favorites: selectFavorites(state),
  recent: selectRecent(state),
  search: selectSearch(state),
  loading: selectLoading(state),
});

const mapDispatchToProps = {
  addFavorite: addFavoriteAction,
  deleteFavorite: deleteFavoriteAction,
  deleteAllFavorites: deleteAllFavoritesAction,
  setAnimateToArea: setAnimateToAreaAction,
  updateRecentSearches: updateRecentSearchesAction,
  deleteAllRecentSearches: deleteAllRecentSearchesAction,
  setCurrentLocation: setCurrentLocationAction,
  searchLocation: searchLocationAction,
  resetSearch: resetSearchAction,
  setLoading: setLoadingAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type SearchScreenProps = PropsFromRedux & {
  navigation: StackNavigationProp<
    MapStackParamList | WeatherStackParamList,
    'Search'
  >;
};

const SearchScreen: React.FC<SearchScreenProps> = ({
  favorites,
  recent,
  search,
  loading,
  addFavorite,
  deleteFavorite,
  deleteAllFavorites,
  setAnimateToArea,
  updateRecentSearches,
  deleteAllRecentSearches,
  setCurrentLocation,
  searchLocation,
  resetSearch,
  setLoading,
  navigation,
}) => {
  const { t } = useTranslation('searchScreen');
  const { colors } = useTheme() as CustomTheme;
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = React.useState('');

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, 250); // 250 ms delay
    return () => clearTimeout(timeout);
  }, [value]);

  useEffect(() => {
    if (debouncedValue) {
      setLoading(true);
      searchLocation(debouncedValue);
    } else {
      resetSearch();
    }
  }, [debouncedValue, searchLocation, resetSearch, setLoading]);

  const handleSelectLocation = (location: Location, update: boolean) => {
    const name =
      location.area && location.area !== location.name
        ? `${location.name}, ${location.area}`
        : location.name;

    AccessibilityInfo.announceForAccessibility(
      t('selectedLocation', { location: name })
    );
    Keyboard.dismiss();
    setAnimateToArea(true);
    setValue('');

    if (update) {
      updateRecentSearches(location);
    }

    setCurrentLocation(location);
    navigation.goBack();
  };

  const isFavorite = (location: Location) =>
    favorites.length > 0 && favorites.some(({ id }) => id === location.id);

  return (
    <View testID="search_view" style={styles.container}>
      <Text
        style={[
          styles.placeholderText,
          {
            color: colors.text,
          },
        ]}>
        {t('label')}
      </Text>
      <View
        style={[
          styles.searchBoxContainer,
          { backgroundColor: colors.inputBackground },
        ]}>
        <Icon
          name="search"
          width={22}
          height={22}
          style={[styles.searchIcon, { color: colors.text }]}
        />
        <TextInput
          testID="search_input"
          accessibilityRole="search"
          style={[
            styles.input,
            {
              color: colors.text,
            },
          ]}
          autoCorrect={false}
          maxLength={40}
          placeholder={t('placeholder')}
          placeholderTextColor={colors.text}
          value={value}
          onChangeText={(text) => setValue(text)}
          underlineColorAndroid="transparent"
        />
        {loading && <ActivityIndicator accessibilityLabel={t('loading')} />}
        {value.length > 0 && (
          <CloseButton
            testID="search_clear_button"
            style={styles.closeButton}
            backgroundColor={colors.inputButtonBackground}
            accessibilityLabel={t('clear')}
            onPress={() => setValue('')}
          />
        )}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.results}>
          {search.length > 0 && (
            <AreaList
              testID="search_results"
              elements={search}
              title={t('searchResults')}
              onSelect={(location) => handleSelectLocation(location, true)}
              onIconPress={(location) => {
                addFavorite(location as Location);
                setValue('');
                Keyboard.dismiss();
              }}
              iconNameGetter={(location) =>
                isFavorite(location) ? 'star-selected' : 'star-unselected'
              }
            />
          )}
          {!loading && !/^\s*$/.test(value) && search.length === 0 && (
            <Text style={{ color: colors.text }}>{t('noResults')}</Text>
          )}
          <View
            style={styles.locateRow}
            accessible
            accessibilityRole="button"
            onAccessibilityTap={() => {
              trackMatomoEvent('User action', 'Geolocation', 'Accessibility Tap');
              getGeolocation(setCurrentLocation, t);
              navigation.goBack();
            }}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('locate')}
            </Text>
            <IconButton
              icon="locate"
              accessibilityLabel=""
              iconColor={colors.text}
              backgroundColor={colors.inputBackground}
              onPress={() => {
                trackMatomoEvent('User action', 'Geolocation', 'Button');
                getGeolocation(setCurrentLocation, t);
                navigation.goBack();
              }}
            />
          </View>
          {favorites.length > 0 && (
            <AreaList
              elements={favorites}
              title={t('favorites')}
              onSelect={(location) => handleSelectLocation(location, false)}
              onIconPress={(location) => {
                deleteFavorite(location.id);
                updateRecentSearches(location);
              }}
              iconName="star-selected"
              clearTitle={t('clearFavorites')}
              onClear={() => deleteAllFavorites()}
            />
          )}
          {recent.length > 0 && (
            <AreaList
              elements={recent.slice(0).reverse()}
              title={t('recentSearches')}
              onSelect={(location) => handleSelectLocation(location, false)}
              onIconPress={(location) =>
                isFavorite(location)
                  ? deleteFavorite(location.id)
                  : addFavorite(location)
              }
              iconNameGetter={(location) =>
                isFavorite(location) ? 'star-selected' : 'star-unselected'
              }
              clearTitle={t('clearRecentSearches')}
              onClear={() => deleteAllRecentSearches()}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  searchBoxContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 11,
    marginTop: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  searchIcon: {
    marginRight: 8,
  },
  results: {
    flex: 1,
    marginBottom: 10,
  },
  input: {
    flexGrow: 1,
    paddingVertical: 0,
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
  },
  locateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    marginTop: 12,
    height: 44,
  },
  closeButton: {
    marginLeft: 11,
  },
  placeholderText: {
    paddingTop: 10,
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
});

export default connector(React.memo(SearchScreen));
