import React, { JSX } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Icon from '@assets/Icon';

type HeaderBackImageProps = {
  tintColor: string;
};

const HeaderBackImage = ({ tintColor }: HeaderBackImageProps): JSX.Element => {
  return (
    <View style={styles.headerBackImage}>
      <Icon
        name="arrow-back"
        style={{ color: tintColor }}
        width={26}
        height={26}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerBackImage: {
    flex: 1,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        marginLeft: 22,
      },
    }),
  },
});

export default HeaderBackImage;