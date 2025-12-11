
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import moment from 'moment';

import { State } from '@store/types';
import { selectLoading, selectError, selectMeteorologistSnapshot } from '@store/meteorologist/selector';
import { selectClockType } from '@store/settings/selectors';
import { CustomTheme } from '@assets/colors';
import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  error: selectError(state),
  snapshot: selectMeteorologistSnapshot(state),
  clockType: selectClockType(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type MeteorologistSnapshotProps = PropsFromRedux & {
  gridLayout?: boolean;
};

// Only available in finnish for locations in Finland

const MeteorologistSnapshot: React.FC<MeteorologistSnapshotProps> = ({
  loading,
  error,
  snapshot,
  clockType,
  gridLayout,
}) => {
  const insets = useSafeAreaInsets();
  const { dark, colors } = useTheme() as CustomTheme;
  const colorMode = dark ? 'dark' : 'light';
  const timeFormat = clockType === 12 ? 'D.M.YYYY h.mm a' : 'D.M.YYYY HH:mm';
  const marginLeft = gridLayout ? 8 : insets.left + 16;
  const marginRight = gridLayout ? insets.right : insets.right + 16;
  const minHeight = gridLayout ? 160 : 150;

  if (loading) {
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <MotiView style={{ marginLeft, marginRight, marginTop: 16 }}>
        <Skeleton colorMode={colorMode} width={'100%'} height={minHeight} radius={10} />
      </MotiView>
    );
  }

  if (error || !snapshot) {
    return (
      <View style={[styles.box, styles.content, {
        backgroundColor: colors.meteorologistSnapshotCard,
        marginLeft,
        marginRight,
        minHeight
      }]}>
        <Text style={[styles.title, { color: colors.primaryText }]}>Meteorologin sääkatsaus</Text>
        <Text style={[styles.text, { color: colors.primaryText }]}>Sääkatsauksen hakeminen epäonnistui</Text>
      </View>
    )
  }

  if (snapshot) {
    return (
      <View style={[styles.box, styles.content, {
        backgroundColor: colors.meteorologistSnapshotCard,
        marginLeft,
        marginRight,
        minHeight,
      }]}>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.primaryText }]}
        >
          Meteorologin sääkatsaus
        </Text>
        { snapshot.hasAlert && (
          <Icon
            accessible={true}
            accessibilityRole="image"
            style={styles.warningIcon}
            accessibilityLabel="Sääkatsaus sisältää varoituksia"
            name="warnings" size={24}
            color={colors.primaryText}
          />
        )}
        <Text style={[styles.updated, { color: colors.primaryText }]}>
          { moment(snapshot.date).format(timeFormat) }
        </Text>
        <Text style={[styles.text, { color: colors.primaryText }]}>{snapshot.text}</Text>
      </View>
    )
  }

  return null;
}

const styles = StyleSheet.create({
  box: {
    margin: 16,
    minHeight: 150,
    borderRadius: 10,
  },
  content: {
    padding: 16,
  },
  title: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  updated: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
  },
  warningIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
});

export default connector(MeteorologistSnapshot);
