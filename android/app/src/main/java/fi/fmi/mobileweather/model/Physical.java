package fi.fmi.mobileweather.model;

public record Physical(
    int windIntensity,
    String windIntensityUom,
    int windDirection,
    String windDirectionUom
) {
}
