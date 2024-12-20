package fi.fmi.mobileweather;

import java.util.List;

//public class WarningsRecord {

    record Warning(
            String type,
            String language,
            String severity,
            String description,
            Duration duration,
            Physical physical
    ) {
    }

    record Duration(
            String startTime,
            String endTime
    ) {
    }

    record Physical(
            int windIntensity,
            String windIntensityUom,
            int windDirection,
            String windDirectionUom
    ) {
    }

    record Data(
            String updated,
            List<Warning> warnings,
            String startTime,
            String endTime
    ) {
    }

    record WarningsRecordRoot(
            Data data
    ) {
    }

//}
