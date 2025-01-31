package fi.fmi.mobileweather.model;

import java.util.List;

public record Data(
    String updated,
    List<Warning> warnings,
    String startTime,
    String endTime
) {
}
