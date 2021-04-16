import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import Config from 'react-native-config';

import { MapStackParamList } from '../navigators/types';
import { State } from '../store/types';
import { selectFavorites } from '../store/settings/selectors';
import {
  addFavorite as addFavoriteAction,
  deleteFavorite as deleteFavoriteAction,
} from '../store/settings/actions';
import { Location } from '../store/settings/types';
import { setAnimateToArea as setAnimateToAreaAction } from '../store/map/actions';

import IconButton from '../components/IconButton';

import { getItem, setItem, RECENT_SEARCHES } from '../utils/async_storage';
import {
  PRIMARY_BLUE,
  WHITE,
  VERY_LIGHT_BLUE,
  GRAYISH_BLUE,
} from '../utils/colors';

const MAX_RECENT_SEARCHES = 10; // TODO: define max number of favorites

const mapStateToProps = (state: State) => ({
  favorites: selectFavorites(state),
});

const mapDispatchToProps = {
  addFavorite: addFavoriteAction,
  deleteFavorite: deleteFavoriteAction,
  setAnimateToArea: setAnimateToAreaAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type SearchScreenProps = PropsFromRedux & {
  navigation: StackNavigationProp<MapStackParamList, 'Search'>;
};

const SearchScreen: React.FC<SearchScreenProps> = ({
  favorites,
  addFavorite,
  deleteFavorite,
  setAnimateToArea,
  navigation,
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
    // navigate to MapScreen with params
    navigation.navigate('Map', searchObj);
    const newRecentSearches = recentSearches
      .filter((search) => search.id !== id)
      .concat(searchObj)
      .slice(-MAX_RECENT_SEARCHES);

    setRecentSearches(newRecentSearches);
    setItem(RECENT_SEARCHES, JSON.stringify(newRecentSearches));
  };
  console.log('locations', locations);
  return (
    <SafeAreaView style={styles.container}>
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
          placeholder={t('map:searchScreen:placeholder')}
          placeholderTextColor={PRIMARY_BLUE}
          value={value}
          onChangeText={(text) => setValue(text)}
          underlineColorAndroid="transparent"
        />
      </View>
      <View style={styles.results}>
        {locations.length > 0 && (
          <>
            <View
              style={[
                styles.resultsHeader,
                styles.withBorderBottom,
                styles.listItem,
              ]}>
              <Text style={styles.title}>
                {t('map:searchScreen:searchResults')}
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {locations.map((location: Location, i) => (
                <View
                  key={location.id}
                  style={
                    i + 1 !== locations.length && [styles.withBorderBottom]
                  }>
                  <TouchableOpacity
                    onPress={() => handleSelectLocation(location)}>
                    <View style={styles.listItem}>
                      <Text style={styles.resultText}>
                        {location.area && location.area !== location.name
                          ? `${location.name}, ${location.area}`
                          : location.name}
                      </Text>
                      <Icon
                        name="chevron-forward"
                        size={22}
                        color={PRIMARY_BLUE}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </>
        )}
        {/^\s*$/.test(value) &&
          locations.length === 0 &&
          recentSearches.length > 0 && (
            <>
              <TouchableOpacity
                onPress={() => setRecentSearchesOpen((prev) => !prev)}>
                <View style={[styles.resultsHeader, styles.listItem]}>
                  <Text style={styles.title}>
                    {t('map:searchScreen:recentSearches')}
                  </Text>
                  {recentSearchesOpen ? (
                    <IconButton
                      icon="chevron-up"
                      style={styles.iconStyle}
                      backgroundColor={WHITE}
                      iconColor={PRIMARY_BLUE}
                      iconSize={20}
                    />
                  ) : (
                    <IconButton
                      icon="chevron-down"
                      style={styles.iconStyle}
                      backgroundColor={WHITE}
                      iconColor={PRIMARY_BLUE}
                      iconSize={20}
                    />
                  )}
                </View>
              </TouchableOpacity>
              {recentSearchesOpen && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.recentListContainer}>
                  {recentSearches
                    .slice(0)
                    .reverse()
                    .map((search, i) => (
                      <View
                        key={search.id}
                        style={
                          i + 1 !== recentSearches.length && [
                            styles.withBorderBottom,
                          ]
                        }>
                        <View style={styles.listItem}>
                          <TouchableOpacity
                            onPress={() => handleSelectLocation(search)}>
                            <View style={styles.listItem}>
                              <Text style={styles.resultText}>
                                {search.area && search.area !== search.name
                                  ? `${search.name}, ${search.area}`
                                  : search.name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          {favorites.length > 0 &&
                          favorites.some((f) => f.id === search.id) ? (
                            <TouchableOpacity
                              onPress={() => deleteFavorite(search.id)}>
                              <View style={styles.actionButtonContainer}>
                                <IconButton
                                  icon="remove-outline"
                                  style={styles.iconStyle}
                                  backgroundColor={GRAYISH_BLUE}
                                  iconColor={PRIMARY_BLUE}
                                  iconSize={20}
                                />
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              onPress={() => addFavorite(search)}>
                              <View style={styles.actionButtonContainer}>
                                <IconButton
                                  icon="add-outline"
                                  style={styles.iconStyle}
                                  backgroundColor={PRIMARY_BLUE}
                                  iconColor={WHITE}
                                  iconSize={20}
                                />
                              </View>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                </ScrollView>
              )}
            </>
          )}
        {/^\s*$/.test(value) && locations.length === 0 && favorites.length > 0 && (
          <>
            <TouchableOpacity onPress={() => setFavoritesOpen((prev) => !prev)}>
              <View
                style={[
                  styles.resultsHeader,
                  styles.withBorderBottom,
                  styles.listItem,
                ]}>
                <Text style={styles.title}>
                  {t('map:searchScreen:favorites')}
                </Text>
                {favoritesOpen ? (
                  <IconButton
                    icon="chevron-up"
                    style={styles.iconStyle}
                    backgroundColor={WHITE}
                    iconColor={PRIMARY_BLUE}
                    iconSize={20}
                  />
                ) : (
                  <IconButton
                    icon="chevron-down"
                    style={styles.iconStyle}
                    backgroundColor={WHITE}
                    iconColor={PRIMARY_BLUE}
                    iconSize={20}
                  />
                )}
              </View>
            </TouchableOpacity>
            {favoritesOpen && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {favorites.map((favorite: Location, i: number) => (
                  <View
                    key={favorite.id}
                    style={
                      i + 1 !== recentSearches.length && [
                        styles.withBorderBottom,
                      ]
                    }>
                    <View style={styles.listItem}>
                      <TouchableOpacity
                        onPress={() => handleSelectLocation(favorite)}>
                        <View style={styles.listItem}>
                          <Text style={styles.resultText}>
                            {favorite.area && favorite.area !== favorite.name
                              ? `${favorite.name}, ${favorite.area}`
                              : favorite.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteFavorite(favorite.id)}>
                        <View style={styles.actionButtonContainer}>
                          <IconButton
                            icon="remove-outline"
                            style={styles.iconStyle}
                            backgroundColor={GRAYISH_BLUE}
                            iconColor={PRIMARY_BLUE}
                            iconSize={20}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}
        {!/^\s*$/.test(value) && locations.length === 0 && (
          <Text>Haku ei tuottanut tuloksia</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    paddingHorizontal: 20,
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
  },
  resultsHeader: {
    height: 48,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: WHITE,
  },
  input: {
    height: '100%',
    flexGrow: 1,
    paddingVertical: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
    borderColor: VERY_LIGHT_BLUE,
  },
  resultText: {
    fontSize: 15,
    height: 18,
    color: PRIMARY_BLUE,
    marginLeft: 16,
  },
  actionButtonContainer: {
    width: 50,
    borderLeftWidth: 1,
    borderColor: VERY_LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentListContainer: {
    maxHeight: '45%',
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
});

export default connector(SearchScreen);
