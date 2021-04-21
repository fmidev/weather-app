import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Config from 'react-native-config';

import { State } from '../store/types';
import { selectFavorites } from '../store/settings/selectors';
import {
  addFavorite as addFavoriteAction,
  deleteFavorite as deleteFavoriteAction,
} from '../store/settings/actions';
import { Location } from '../store/settings/types';
import { setAnimateToArea as setAnimateToAreaAction } from '../store/map/actions';
import { setActiveLocation as setActiveLocationAction } from '../store/general/actions';

import CollapsibleAreaList from './CollapsibleAreaList';
import CloseButton from './CloseButton';

import { getItem, setItem, RECENT_SEARCHES } from '../utils/async_storage';
import { PRIMARY_BLUE, VERY_LIGHT_BLUE } from '../utils/colors';

const MAX_RECENT_SEARCHES = 10; // TODO: define max number of favorites

const mapStateToProps = (state: State) => ({
  favorites: selectFavorites(state),
});

const mapDispatchToProps = {
  addFavorite: addFavoriteAction,
  deleteFavorite: deleteFavoriteAction,
  setAnimateToArea: setAnimateToAreaAction,
  setActiveLocation: setActiveLocationAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type SearchScreenProps = PropsFromRedux & {
  onClose: () => void;
  onLocationSelect?: () => void;
};

const SearchScreen: React.FC<SearchScreenProps> = ({
  favorites,
  addFavorite,
  deleteFavorite,
  setAnimateToArea,
  setActiveLocation,
  onClose,
  onLocationSelect,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [locations, setLocations] = useState([]);
  const [recentSearches, setRecentSearches] = useState<Location[] | []>([]);
  const [recentSearchesOpen, setRecentSearchesOpen] = useState<boolean>(true);
  const [favoritesOpen, setFavoritesOpen] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    getItem(RECENT_SEARCHES).then((data) => {
      if (data && mounted) {
        const searches = JSON.parse(data);
        setRecentSearches(searches);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    locationQuery(value);
  }, [value]);

  const locationQuery = (text: string) => {
    // no need to fetch if text is empty or whitespace
    if (!text || /^\s*$/.test(text)) {
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

  const handleSelectLocation = (location: {
    name: string;
    area: string;
    lat: number;
    lon: number;
    id: number;
  }) => {
    Keyboard.dismiss();
    setAnimateToArea(true);
    setValue('');
    const { name, area, lat, lon, id } = location;
    const searchObj = { name, area, lat, lon, id };
    setActiveLocation(searchObj);
    const newRecentSearches = recentSearches
      .filter((search) => search.id !== id)
      .concat(searchObj)
      .slice(-MAX_RECENT_SEARCHES);

    setRecentSearches(newRecentSearches);
    setItem(RECENT_SEARCHES, JSON.stringify(newRecentSearches));
    if (onLocationSelect) onLocationSelect();
    onClose();
  };

  const isFavorite = (location: Location) =>
    favorites.length > 0 && favorites.some((f) => f.id === location.id);

  return (
    <View style={styles.container}>
      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={t(
            'map:searchBottomSheet:closeAccessibilityLabel'
          )}
        />
      </View>
      <View style={styles.searchBoxContainer}>
        <Icon
          name="search-outline"
          size={22}
          color={PRIMARY_BLUE}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          autoCorrect={false}
          maxLength={40}
          placeholder={t('map:searchBottomSheet:placeholder')}
          placeholderTextColor={PRIMARY_BLUE}
          value={value}
          onChangeText={(text) => setValue(text)}
          underlineColorAndroid="transparent"
        />
      </View>
      <View style={styles.results}>
        {locations.length > 0 && (
          <CollapsibleAreaList
            elements={locations}
            open
            title={t('map:searchBottomSheet:searchResults')}
            onSelect={(location) => handleSelectLocation(location)}
            onIconPress={(location) => {
              addFavorite(location as Location);
              setValue('');
              Keyboard.dismiss();
            }}
            iconNameGetter={(location) =>
              isFavorite(location) ? 'remove-outline' : 'add-outline'
            }
          />
        )}
        {/^\s*$/.test(value) &&
          locations.length === 0 &&
          favorites.length > 0 && (
            <CollapsibleAreaList
              elements={favorites}
              open={favoritesOpen}
              onToggle={() => setFavoritesOpen((prev) => !prev)}
              title={t('map:searchBottomSheet:favorites')}
              onSelect={(location) => handleSelectLocation(location)}
              onIconPress={(location) => deleteFavorite(location.id)}
              iconName="remove-outline"
            />
          )}
        {/^\s*$/.test(value) &&
          locations.length === 0 &&
          recentSearches.length > 0 && (
            <CollapsibleAreaList
              elements={recentSearches.slice(0).reverse()}
              open={recentSearchesOpen}
              onToggle={() => setRecentSearchesOpen((prev) => !prev)}
              title={t('map:searchBottomSheet:recentSearches')}
              onSelect={(location) => handleSelectLocation(location)}
              onIconPress={(location) =>
                isFavorite(location)
                  ? deleteFavorite(location.id)
                  : addFavorite(location)
              }
              iconNameGetter={(location) =>
                isFavorite(location) ? 'remove-outline' : 'add-outline'
              }
            />
          )}
        {!/^\s*$/.test(value) && locations.length === 0 && (
          <Text>Haku ei tuottanut tuloksia</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 20,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  searchBoxContainer: {
    height: 48,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    backgroundColor: VERY_LIGHT_BLUE,
    marginTop: 10,
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
  },
});

export default connector(SearchScreen);
