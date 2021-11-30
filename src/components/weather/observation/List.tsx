import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TimeStepData } from '@store/observation/types';
import moment from 'moment';
import { ChartType } from '../charts/types';

type ListProps = {
  data: TimeStepData[];
  parameter: ChartType;
};
const List: React.FC<ListProps> = ({ data, parameter }) => (
  <View style={styles.observationListContainer}>
    <View>
      {data && data.length > 0 && (
        <Text style={(styles.bold, styles.marginBottom)}>
          {moment(data[0].epochtime * 1000).format(`dddd D.M.`)}
        </Text>
      )}
    </View>
    {parameter === 'temperature' && (
      <View style={styles.observationRow}>
        <Text style={[styles.bold, styles.observationRow]}>Aika</Text>
        <Text style={[styles.bold, styles.observationRow]}>Lämpötila</Text>
        <Text style={[styles.bold, styles.observationRow]}>Kastepiste</Text>
      </View>
    )}
    {parameter === 'precipitation' && (
      <View style={styles.observationRow}>
        <Text style={[styles.bold, styles.observationRow]}>Aika</Text>
        <Text style={[styles.bold, styles.observationRow]}>Sademäärä</Text>
      </View>
    )}
    {parameter === 'wind' && (
      <View style={styles.observationRow}>
        <Text style={[styles.bold, styles.observationRow]}>{'\n'}Aika</Text>
        <Text style={[styles.bold, styles.observationRow]}>
          Tuulen{'\n'}nopeus
        </Text>
        <Text style={[styles.bold, styles.observationRow]}>
          Tuulen{'\n'}puuska
        </Text>
        <Text style={[styles.bold, styles.observationRow]}>
          Tuulen{'\n'}suunta
        </Text>
      </View>
    )}
    {parameter === 'pressure' && (
      <View style={styles.observationRow}>
        <Text style={[styles.bold, styles.observationRow]}>Aika</Text>
        <Text style={[styles.bold, styles.observationRow]}>Paine</Text>
      </View>
    )}
    {parameter === 'humidity' && (
      <View style={styles.observationRow}>
        <Text style={[styles.bold, styles.observationRow]}>Aika</Text>
        <Text style={[styles.bold, styles.observationRow]}>Kosteus</Text>
      </View>
    )}
    {parameter === 'visCloud' && (
      <View style={styles.observationRow}>
        <Text style={[styles.bold, styles.observationRow]}>Aika</Text>
        <Text style={[styles.bold, styles.observationRow]}>Näkyvyys</Text>
        <Text style={[styles.bold, styles.observationRow]}>Pilvisyys</Text>
      </View>
    )}
    {parameter === 'cloud' && (
      <View style={styles.observationRow}>
        <Text style={[styles.bold, styles.observationRow]}>Aika</Text>
        <Text style={[styles.bold, styles.observationRow]}>
          Pilven alarajan korkeus
        </Text>
      </View>
    )}

    <View
      style={
        (styles.marginBottom,
        {
          borderBottomWidth: 1,
          borderBottomColor: 'lightgray',
        })
      }
    />

    {data
      .filter((ob) => ob.epochtime % 3600 === 0)
      .map((timeStep) => (
        <View key={timeStep.epochtime} style={styles.observationRow}>
          {parameter === 'temperature' && (
            <View style={styles.observationRow}>
              <Text style={[styles.bold, styles.observationRow]}>
                klo {moment(timeStep.epochtime * 1000).format(`HH:mm`)}
              </Text>
              <Text style={styles.observationRow}>
                {timeStep.temperature} °C
              </Text>
              <Text style={styles.observationRow}>{timeStep.dewpoint} °C</Text>
            </View>
          )}
          {parameter === 'precipitation' && (
            <View style={styles.observationRow}>
              <Text style={[styles.bold, styles.observationRow]}>
                klo {moment(timeStep.epochtime * 1000).format(`HH:mm`)}
              </Text>
              <Text style={styles.observationRow}>
                {timeStep.precipitation1h} mm
              </Text>
            </View>
          )}
          {parameter === 'wind' && (
            <View style={[styles.observationRow]}>
              <Text style={[styles.bold, styles.observationRow]}>
                klo {moment(timeStep.epochtime * 1000).format(`HH:mm`)}
              </Text>
              <Text style={styles.observationRow}>
                {timeStep.windspeedms?.toFixed(0)} m/s
              </Text>

              <Text style={styles.observationRow}>
                {timeStep.windgust?.toFixed(0)} m/s
              </Text>
              <Text style={styles.observationRow}>{timeStep.windcompass8}</Text>
            </View>
          )}
          {parameter === 'pressure' && (
            <View style={styles.observationRow}>
              <Text style={[styles.bold, styles.observationRow]}>
                klo {moment(timeStep.epochtime * 1000).format(`HH:mm`)}
              </Text>
              <Text style={styles.observationRow}>
                {timeStep.pressure?.toFixed(0)} hPa
              </Text>
            </View>
          )}
          {parameter === 'humidity' && (
            <View style={styles.observationRow}>
              <Text style={[styles.bold, styles.observationRow]}>
                klo {moment(timeStep.epochtime * 1000).format(`HH:mm`)}
              </Text>
              <Text style={styles.observationRow}>
                {timeStep.humidity?.toFixed(0)} %
              </Text>
            </View>
          )}
          {parameter === 'visCloud' && (
            <View style={[styles.observationRow]}>
              <Text style={[styles.bold, styles.observationRow]}>
                klo {moment(timeStep.epochtime * 1000).format(`HH:mm`)}
              </Text>
              <Text style={styles.observationRow}>
                {(timeStep.visibility! / 1000)?.toFixed(0)} km
              </Text>
              <Text style={styles.observationRow}>
                {timeStep.totalcloudcover}/8
              </Text>
            </View>
          )}
          {parameter === 'cloud' && (
            <View style={styles.observationRow}>
              <Text style={[styles.bold, styles.observationRow]}>
                klo {moment(timeStep.epochtime * 1000).format(`HH:mm`)}
              </Text>
              <Text style={styles.observationRow}>
                {(timeStep.cloudheight! / 1000)?.toFixed(1)} km
              </Text>
            </View>
          )}
        </View>
      ))}
  </View>
);

const styles = StyleSheet.create({
  bold: {
    fontFamily: 'Roboto-Bold',
    paddingBottom: 2,
  },
  marginBottom: {
    marginBottom: 20,
  },
  observationListContainer: {
    marginTop: 20,
  },
  observationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingBottom: 1,
  },
});
export default List;
