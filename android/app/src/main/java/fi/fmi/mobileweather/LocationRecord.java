package fi.fmi.mobileweather;

public record LocationRecord(
    int geoid,
    String name,
    String region,
    double latitude,
    double longitude,
    String country,
    String iso2,
    String localtz
) {}
