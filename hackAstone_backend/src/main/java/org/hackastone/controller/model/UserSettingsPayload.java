package org.hackastone.controller.model;

import lombok.Data;

@Data
public class UserSettingsPayload {
    private String locale;
    private Preferences preferences;
    private Notifications notifications;
    private Appearance appearance;

    @Data
    public static class Preferences {
        private Boolean autoSave;
        private Boolean sound;
        private Boolean timer;
        private Boolean compact;
        private Boolean animations;
    }

    @Data
    public static class Notifications {
        private Boolean daily;
        private Boolean weekly;
        private Boolean updates;
    }

    @Data
    public static class Appearance {
        /** dark | darker | midnight */
        private String theme;
    }
}
