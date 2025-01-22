package fi.fmi.mobileweather.model;

import android.util.Log;

public record Warning(
    String type,
    String language,
    String severity,
    String description,
    Duration duration,
    Physical physical
) implements Comparable<Warning> {
    private int getSeverityValue() {
        switch(severity) {
            case "Extreme": return 3;
            case "Severe": return 2;
            case "Moderate": return 1;
            default: return 0;
        }
    }

    private int getTypePriorityValue() {
        switch(type) {
            case "thunderstorm": return 17;
            case "forestFireWeather": return 16;
            case "grassFireWeather": return 15;
            case "wind": return 14;
            case "trafficWeather": return 13;
            case "rain": return 12;
            case "pedestrianSafety": return 11;
            case "hotWeather": return 10;
            case "coldWeather": return 9;
            case "uvNote": return 8;
            case "flooding": return 7;
            case "seaWind": return 6;
            case "seaThunderStorm": return 5;
            case "seaWaveHeight": return 4;
            case "seaWaterHeightHighWater": return 3;
            case "seaWaterHeightShallowWater": return 2;
            case "seaIcing": return 1;
            default: return 0;
        }
    }

    @Override
    public int compareTo(Warning other) {
        Log.d("compareTo", "this: "+this.getSeverityValue()+ " other: "+other.getSeverityValue());
        int severityComparison = Integer.compare(other.getSeverityValue(), this.getSeverityValue());
        if (severityComparison != 0) {
            return severityComparison;
        }

        return Integer.compare(other.getTypePriorityValue(), this.getTypePriorityValue());
    }
}

//}
