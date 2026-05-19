package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ArenaDataService implements InitializingBean {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private Map<String, Object> catalogBase;
    private Map<String, Object> profile;
    private List<Map<String, Object>> homeTimePeriodsBase;
    private Map<String, Map<String, String>> i18nByLocale = new HashMap<>();
    private Map<String, Object> philosophersEnOverlay = Map.of();
    private Map<String, Object> battlesEnOverlay = Map.of();

    @Override
    public void afterPropertiesSet() throws Exception {
        catalogBase = readResourceMap("arena/catalog.json");
        profile = readResourceMap("arena/profile.json");
        homeTimePeriodsBase = readResourceList("arena/home-time-periods.json");
        i18nByLocale.put("en", readStringMap("arena/i18n-en.json"));
        i18nByLocale.put("zh", readStringMap("arena/i18n-zh.json"));
        philosophersEnOverlay = readResourceMap("arena/locale-en/philosophers.json");
        battlesEnOverlay = readResourceMap("arena/locale-en/battles.json");
    }

    private Map<String, Object> readResourceMap(String classpathLocation) throws IOException {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(classpathLocation)) {
            if (in == null) {
                return Map.of();
            }
            return objectMapper.readValue(in, new TypeReference<Map<String, Object>>() {});
        }
    }

    private List<Map<String, Object>> readResourceList(String classpathLocation) throws IOException {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(classpathLocation)) {
            if (in == null) {
                throw new IllegalStateException("Classpath resource missing: " + classpathLocation);
            }
            return objectMapper.readValue(in, new TypeReference<List<Map<String, Object>>>() {});
        }
    }

    private Map<String, String> readStringMap(String classpathLocation) throws IOException {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(classpathLocation)) {
            if (in == null) {
                throw new IllegalStateException("Classpath resource missing: " + classpathLocation);
            }
            return objectMapper.readValue(in, new TypeReference<Map<String, String>>() {});
        }
    }

    public static String normalizeLocale(String locale) {
        if (locale == null || locale.trim().isEmpty()) {
            return "en";
        }
        String l = locale.trim().toLowerCase(Locale.ROOT);
        if (l.startsWith("zh")) {
            return "zh";
        }
        return "en";
    }

    public Map<String, String> getI18nStrings(String locale) {
        String key = normalizeLocale(locale);
        Map<String, String> strings = i18nByLocale.get(key);
        if (strings == null) {
            strings = i18nByLocale.get("en");
        }
        return strings;
    }

    public Map<String, Object> getI18nPayload(String locale) {
        String normalized = normalizeLocale(locale);
        Map<String, Object> out = new HashMap<>();
        out.put("locale", normalized);
        out.put("strings", getI18nStrings(normalized));
        return out;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCatalog(String locale) {
        String normalized = normalizeLocale(locale);
        Map<String, String> strings = getI18nStrings(normalized);
        Map<String, Object> catalog = objectMapper.convertValue(catalogBase, Map.class);

        localizeRegions(catalog, strings);
        catalog.put("timePeriods", localizeHomeTimePeriods(strings));

        List<Map<String, Object>> philosophers = (List<Map<String, Object>>) catalog.get("philosophers");
        if (philosophers != null && "en".equals(normalized)) {
            applyPhilosopherOverlay(philosophers, philosophersEnOverlay);
        }

        List<Map<String, Object>> battles = (List<Map<String, Object>>) catalog.get("battles");
        if (battles != null && "en".equals(normalized)) {
            applyBattleOverlay(battles, battlesEnOverlay);
        }

        catalog.put("locale", normalized);
        return catalog;
    }

    private void localizeRegions(Map<String, Object> catalog, Map<String, String> strings) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> regions = (List<Map<String, Object>>) catalog.get("regions");
        if (regions == null) {
            return;
        }
        for (Map<String, Object> region : regions) {
            Object id = region.get("id");
            if (id != null) {
                String localized = strings.get("region." + id);
                if (localized != null) {
                    region.put("name", localized);
                }
            }
        }
    }

    private List<Map<String, Object>> localizeHomeTimePeriods(Map<String, String> strings) {
        List<Map<String, Object>> periods = objectMapper.convertValue(
                homeTimePeriodsBase,
                new TypeReference<List<Map<String, Object>>>() {}
        );
        for (Map<String, Object> period : periods) {
            Object id = period.get("id");
            if (id == null) {
                continue;
            }
            String label = strings.get("homePeriod." + id + ".label");
            String era = strings.get("homePeriod." + id + ".era");
            if (label != null) {
                period.put("label", label);
            }
            if (era != null) {
                period.put("era", era);
            }
        }
        return periods;
    }

    @SuppressWarnings("unchecked")
    private void applyPhilosopherOverlay(
            List<Map<String, Object>> philosophers,
            Map<String, Object> overlayById
    ) {
        for (Map<String, Object> philosopher : philosophers) {
            Object id = philosopher.get("id");
            if (id == null) {
                continue;
            }
            Object overlay = overlayById.get(id.toString());
            if (!(overlay instanceof Map)) {
                continue;
            }
            Map<String, Object> fields = (Map<String, Object>) overlay;
            mergePhilosopherField(philosopher, fields, "school");
            mergePhilosopherField(philosopher, fields, "summary");
            mergePhilosopherField(philosopher, fields, "birthPlace");
            mergePhilosopherField(philosopher, fields, "lifespan");
            if (fields.get("keyIdeas") instanceof List) {
                philosopher.put("keyIdeas", fields.get("keyIdeas"));
            }
            if (fields.get("majorWorks") instanceof List) {
                philosopher.put("majorWorks", fields.get("majorWorks"));
            }
            if (fields.get("famousQuotes") instanceof List) {
                philosopher.put("famousQuotes", fields.get("famousQuotes"));
            }
        }
    }

    private void mergePhilosopherField(
            Map<String, Object> philosopher,
            Map<String, Object> fields,
            String key
    ) {
        Object value = fields.get(key);
        if (value != null) {
            philosopher.put(key, value);
        }
    }

    @SuppressWarnings("unchecked")
    private void applyBattleOverlay(List<Map<String, Object>> battles, Map<String, Object> overlayById) {
        for (Map<String, Object> battle : battles) {
            Object id = battle.get("id");
            if (id == null) {
                continue;
            }
            Object overlay = overlayById.get(id.toString());
            if (!(overlay instanceof Map)) {
                continue;
            }
            Map<String, Object> fields = (Map<String, Object>) overlay;
            for (String key : List.of("question", "category", "builderView", "breakerView", "reveal")) {
                Object value = fields.get(key);
                if (value != null) {
                    battle.put(key, value);
                }
            }
            if (fields.get("judgeQuestions") instanceof List) {
                battle.put("judgeQuestions", fields.get("judgeQuestions"));
            }
        }
    }

    /** @deprecated use {@link #getCatalog(String)} */
    public Map<String, Object> getCatalog() {
        return getCatalog("en");
    }

    public Map<String, Object> getProfile() {
        return profile;
    }
}
