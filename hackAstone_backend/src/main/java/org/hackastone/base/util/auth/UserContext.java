package org.hackastone.base.util.auth;

public class UserContext {

    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();

    public static void setCurrentUserId(String userId) {
        CURRENT_USER.set(userId);
    }

    public static String getCurrentUserId() {
        return CURRENT_USER.get();
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
