import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { State } from '@store/types';
import {
  selectLoading,
  selectError,
  selectMeteorologistSnapshot,
} from '@store/meteorologist/selector';
import { selectClockType } from '@store/settings/selectors';
import { CustomTheme } from '@assets/colors';
import Text from '@components/common/AppText';
import Skeleton from '@components/common/Skeleton';
import AccessibleView from '@components/common/AccessibleView';
import Icon from '@assets/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatAccessibleDateTime } from '@utils/accessibility';
import { REGULAR_FONT, MEDIUM_FONT } from '@assets/constants';

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
  snapshot,
  clockType,
  gridLayout,
}) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme() as CustomTheme;
  const marginLeft = gridLayout ? 8 : insets.left + 16;
  const marginRight = gridLayout ? insets.right : insets.right + 16;
  const marginTop = 16;
  const minHeight = gridLayout ? 160 : 150;
  const groupContent = Platform.OS === 'android';
  const contentAccessibilityProps = {
    accessible: !groupContent,
    importantForAccessibility: groupContent ? 'no-hide-descendants' as const : undefined,
  };
  const title = 'Meteorologin sääkatsaus';
  const loadingError = 'Sääkatsauksen hakeminen epäonnistui';

  if (loading && !snapshot) {
    return (
      <View style={{ marginLeft, marginRight, marginTop }}>
        <Skeleton width="100%" height={minHeight} radius={10} />
      </View>
    );
  }

  if (!snapshot) {
    return (
      <AccessibleView
        accessible={groupContent}
        accessibilityRole={groupContent ? 'header' : undefined}
        accessibilityLabel={groupContent ? `${title}. ${loadingError}` : undefined}
        style={[
          styles.box,
          styles.content,
          {
            backgroundColor: colors.meteorologistSnapshotCard,
            marginLeft,
            marginRight,
            minHeight,
          },
        ]}>
        <Text {...contentAccessibilityProps} style={[styles.title, { color: colors.primaryText }]}>
          {title}
        </Text>
        <Text {...contentAccessibilityProps} style={[styles.text, { color: colors.primaryText }]}>
          {loadingError}
        </Text>
      </AccessibleView>
    );
  }

  if (snapshot) {
    const updatedMoment = moment(snapshot.date);
    const accessibleUpdated = formatAccessibleDateTime(updatedMoment, t, clockType === 24);
    const alertDescription = 'Sääkatsaus sisältää varoituksia';
    const accessibilityLabel = [
      title,
      snapshot.hasAlert ? alertDescription : undefined,
      accessibleUpdated,
      snapshot.text,
    ].filter(Boolean).join('. ');

    return (
      <AccessibleView
        accessible={groupContent}
        accessibilityRole={groupContent ? 'header' : undefined}
        accessibilityLabel={groupContent ? accessibilityLabel : undefined}
        style={[
          styles.box,
          styles.content,
          {
            backgroundColor: colors.meteorologistSnapshotCard,
            marginLeft,
            marginRight,
            minHeight,
          },
        ]}>
        <Text
          {...contentAccessibilityProps}
          accessibilityRole="header"
          style={[styles.title, { color: colors.primaryText }]}>
          {title}
        </Text>
        {snapshot.hasAlert && (
          <Icon
            accessibilityLanguage="fi-FI"
            {...contentAccessibilityProps}
            accessibilityRole="image"
            style={styles.warningIcon}
            accessibilityLabel={alertDescription}
            name="warnings"
            size={24}
            color={colors.primaryText}
          />
        )}
        <Text
          {...contentAccessibilityProps}
          accessibilityLabel={accessibleUpdated}
          style={[styles.updated, { color: colors.primaryText }]}>
          {updatedMoment.formatDateTime(
            'longDateTime',
            i18n.language,
            clockType
          )}
        </Text>
        <Text {...contentAccessibilityProps} style={[styles.text, { color: colors.primaryText }]}>
          {snapshot.text}
        </Text>
      </AccessibleView>
    );
  }

  return null;
};

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
    fontFamily: MEDIUM_FONT,
    fontSize: 16,
    marginBottom: 8,
  },
  updated: {
    fontFamily: MEDIUM_FONT,
    fontSize: 14,
    marginBottom: 8,
  },
  text: {
    fontFamily: REGULAR_FONT,
    fontSize: 14,
  },
  warningIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
});

export default connector(MeteorologistSnapshot);
