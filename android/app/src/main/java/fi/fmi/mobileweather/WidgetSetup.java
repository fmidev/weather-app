package fi.fmi.mobileweather;

public class WidgetSetup {
    private Location location;
    private Weather weather;
    private Warnings warnings;
    private Announcements announcements;
    private Layout layout;

    // Getters and setters
    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public Weather getWeather() {
        return weather;
    }

    public void setWeather(Weather weather) {
        this.weather = weather;
    }

    public Warnings getWarnings() {
        return warnings;
    }

    public void setWarnings(Warnings warnings) {
        this.warnings = warnings;
    }

    public Announcements getAnnouncements() {
        return announcements;
    }

    public void setAnnouncements(Announcements announcements) {
        this.announcements = announcements;
    }

    public Layout getLayout() {
        return layout;
    }

    public void setLayout(Layout layout) {
        this.layout = layout;
    }

    public static class Location {
        private Default defaultLocation;
        private String apiUrl;

        // Getters and setters
        public Default getDefaultLocation() {
            return defaultLocation;
        }

        public void setDefaultLocation(Default defaultLocation) {
            this.defaultLocation = defaultLocation;
        }

        public String getApiUrl() {
            return apiUrl;
        }

        public void setApiUrl(String apiUrl) {
            this.apiUrl = apiUrl;
        }
    }

    public static class Default {
        private String name;
        private String area;
        private int lat;
        private int lon;
        private int id;
        private String country;
        private String timezone;

        // Getters and setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getArea() {
            return area;
        }

        public void setArea(String area) {
            this.area = area;
        }

        public int getLat() {
            return lat;
        }

        public void setLat(int lat) {
            this.lat = lat;
        }

        public int getLon() {
            return lon;
        }

        public void setLon(int lon) {
            this.lon = lon;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }

        public String getTimezone() {
            return timezone;
        }

        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }
    }

    public static class Weather {
        private String apiUrl;
        private boolean useCardinalsForWindDirection;

        // Getters and setters
        public String getApiUrl() {
            return apiUrl;
        }

        public void setApiUrl(String apiUrl) {
            this.apiUrl = apiUrl;
        }

        public boolean isUseCardinalsForWindDirection() {
            return useCardinalsForWindDirection;
        }

        public void setUseCardinalsForWindDirection(boolean useCardinalsForWindDirection) {
            this.useCardinalsForWindDirection = useCardinalsForWindDirection;
        }
    }

    public static class Warnings {
        private String apiUrl;

        // Getters and setters
        public String getApiUrl() {
            return apiUrl;
        }

        public void setApiUrl(String apiUrl) {
            this.apiUrl = apiUrl;
        }
    }

    public static class Announcements {
        private boolean enabled;
        private Api api;

        // Getters and setters
        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public Api getApi() {
            return api;
        }

        public void setApi(Api api) {
            this.api = api;
        }
    }

    public static class Api {
        private String fi;
        private String en;
        private String sv;

        // Getters and setters
        public String getFi() {
            return fi;
        }

        public void setFi(String fi) {
            this.fi = fi;
        }

        public String getEn() {
            return en;
        }

        public void setEn(String en) {
            this.en = en;
        }

        public String getSv() {
            return sv;
        }

        public void setSv(String sv) {
            this.sv = sv;
        }
    }

    public static class Layout {
        private Logo logo;

        // Getters and setters
        public Logo getLogo() {
            return logo;
        }

        public void setLogo(Logo logo) {
            this.logo = logo;
        }
    }

    public static class Logo {
        private boolean enabled;

        // Getters and setters
        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}