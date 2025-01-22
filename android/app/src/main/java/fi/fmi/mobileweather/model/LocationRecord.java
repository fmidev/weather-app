package fi.fmi.mobileweather.model;

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
