package fi.fmi.mobileweather;

record WidgetSetup(
        Location location,
        Weather weather,
        Warnings warnings,
        Announcements announcements,
        Layout layout
) {}

record Location(
        DefaultLocation defaultLocation,
        String apiUrl
) {}

record DefaultLocation(
        String name,
        String area,
        int lat,
        int lon,
        int id,
        String country,
        String timezone
) {}

record Weather(
        String apiUrl,
        int interval,
        boolean useCardinalsForWindDirection
) {}

record Warnings(
        String apiUrl,
        int interval
) {}

record Announcements(
        boolean enabled,
        Api api
) {}

record Api(
        String fi,
        String en,
        String sv
) {}

record Layout(
        Logo logo
) {}

record Logo(
        boolean enabled
) {}

