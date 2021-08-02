import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';
import Config from 'react-native-config';

import Icon from '../components/Icon';

import { MapStackParamList, ForecastStackParamList } from '../navigators/Types';

import { State } from '../store/types';
import {
  selectFavorites,
  selectRecentSearches,
} from '../store/settings/selectors';
import {
  addFavorite as addFavoriteAction,
  deleteFavorite as deleteFavoriteAction,
  deleteAllFavorites as deleteAllFavoritesAction,
  updateRecentSearches as updateRecentSearchesAction,
  deleteAllRecentSearches as deleteAllRecentSearchesAction,
} from '../store/settings/actions';
import { Location } from '../store/settings/types';
import { setAnimateToArea as setAnimateToAreaAction } from '../store/map/actions';
import { setCurrentLocation as setCurrentLocationAction } from '../store/general/actions';

import AreaList from '../components/AreaList';
import IconButton from '../components/IconButton';

import { CustomTheme } from '../utils/colors';

const MAX_RECENT_SEARCHES = 3; // TODO: define max number of recent searches

const mapStateToProps = (state: State) => ({
  favorites: selectFavorites(state),
  recentSearches: selectRecentSearches(state),
});

const mapDispatchToProps = {
  addFavorite: addFavoriteAction,
  deleteFavorite: deleteFavoriteAction,
  deleteAllFavorites: deleteAllFavoritesAction,
  setAnimateToArea: setAnimateToAreaAction,
  updateRecentSearches: updateRecentSearchesAction,
  deleteAllRecentSearches: deleteAllRecentSearchesAction,
  setCurrentLocation: setCurrentLocationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type SearchScreenProps = PropsFromRedux & {
  navigation: StackNavigationProp<
    MapStackParamList | ForecastStackParamList,
    'Search'
  >;
};

const SearchScreen: React.FC<SearchScreenProps> = ({
  favorites,
  recentSearches,
  addFavorite,
  deleteFavorite,
  deleteAllFavorites,
  setAnimateToArea,
  updateRecentSearches,
  deleteAllRecentSearches,
  setCurrentLocation,
  navigation,
}) => {
  // TODO: for some reason this renders twice...
  const { t } = useTranslation('searchScreen');
  const { colors } = useTheme() as CustomTheme;
  const [value, setValue] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    locationQuery(value);
  }, [value]);

  const locationQuery = (text: string) => {
    if (!text) {
      setLocations([]);
      return;
    }

    const queryParams = new URLSearchParams({
      keyword: 'ajax_fi_fi',
      language: 'fi',
      pattern: text,
    });

    // TODO: replace with correct api url (for Smartmet)
    const url = `https://data.fmi.fi/fmi-apikey/${Config.API_KEY}/autocomplete?${queryParams}`;

    fetch(url)
      .then((res) => res.json())
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((json) => {
        setLocations(json?.autocomplete?.result || []);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleSelectLocation = (
    location: {
      name: string;
      area: string;
      lat: number;
      lon: number;
      id: number; // geoid
    },
    update: boolean
  ) => {
    Keyboard.dismiss();
    setAnimateToArea(true);
    setValue('');
    const { name, area, lat, lon, id } = location;
    const searchObj = { name, area, lat, lon, id };
    // navigate to MapScreen with params
    // navigation.navigate('Map', searchObj);
    console.log('Selected location:', searchObj);
    const newRecentSearches = recentSearches
      .filter((search) => search.id !== id)
      .concat(searchObj)
      .slice(-MAX_RECENT_SEARCHES);

    if (update) {
      updateRecentSearches(newRecentSearches);
    }
    setCurrentLocation(location);
    navigation.goBack();
  };
  console.log(locations);
  const isFavorite = (location: Location) =>
    favorites.length > 0 && favorites.some((f) => f.id === location.id);

  return (
    <SafeAreaView style={styles.container}>
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
          style={[styles.input, { color: colors.text }]}
          autoCorrect={false}
          maxLength={40}
          placeholder={t('placeholder')}
          placeholderTextColor={colors.text}
          value={value}
          onChangeText={(text) => setValue(text)}
          underlineColorAndroid="transparent"
        />
      </View>
      {locations.length === 0 && (
        <View style={styles.locateRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('locate')}
          </Text>
          <IconButton
            icon="locate"
            iconColor={colors.text}
            backgroundColor={colors.inputBackground}
          />
        </View>
      )}
      <View style={styles.results}>
        {locations.length > 0 && (
          <AreaList
            elements={locations}
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
        {/^\s*$/.test(value) &&
          locations.length === 0 &&
          favorites.length > 0 && (
            <AreaList
              elements={favorites}
              title={t('favorites')}
              onSelect={(location) => handleSelectLocation(location, false)}
              onIconPress={(location) => deleteFavorite(location.id)}
              iconName="star-unselected"
              clearTitle={t('clearFavorites')}
              onClear={() => deleteAllFavorites()}
            />
          )}
        {/^\s*$/.test(value) &&
          locations.length === 0 &&
          recentSearches.length > 0 && (
            <AreaList
              elements={recentSearches.slice(0).reverse()}
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

        {!/^\s*$/.test(value) && locations.length === 0 && (
          <Text style={{ color: colors.text }}>Haku ei tuottanut tuloksia</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  searchBoxContainer: {
    height: 48,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    marginTop: 10,
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
    height: '100%',
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
});

export default connector(React.memo(SearchScreen));
