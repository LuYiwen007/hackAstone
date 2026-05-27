package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
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
    /** 学科辩论静态对局：zh 来自 catalog 基座，en 来自 overlay；避免运行时 mutate catalogBase */
    private List<Map<String, Object>> bilingualBattlesTemplate = List.of();
    /** 哲学家卡片：zh 来自 catalog 基座，en 来自 overlay */
    private List<Map<String, Object>> bilingualPhilosophersTemplate = List.of();

    @Override
    public void afterPropertiesSet() throws Exception {
        catalogBase = readResourceMap("arena/catalog.json");
        profile = readResourceMap("arena/profile.json");
        homeTimePeriodsBase = readResourceList("arena/home-time-periods.json");
        i18nByLocale.put("en", readStringMap("arena/i18n-en.json"));
        i18nByLocale.put("zh", readStringMap("arena/i18n-zh.json"));
        philosophersEnOverlay = readResourceMap("arena/locale-en/philosophers.json");
        battlesEnOverlay = readResourceMap("arena/locale-en/battles.json");
        bilingualBattlesTemplate = buildBilingualBattlesTemplate();
        bilingualPhilosophersTemplate = buildBilingualPhilosophersTemplate();
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

        catalog.put("philosophers", localizePhilosophers(normalized));
        catalog.put("battles", localizeBattles(normalized));

        catalog.put("locale", normalized);
        return catalog;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildBilingualBattlesTemplate() {
        List<Map<String, Object>> baseBattles = (List<Map<String, Object>>) catalogBase.get("battles");
        if (baseBattles == null) {
            return List.of();
        }
        List<Map<String, Object>> templates = new ArrayList<>();
        for (Map<String, Object> battle : baseBattles) {
            Object id = battle.get("id");
            if (id == null) {
                continue;
            }
            Map<String, Object> zh = extractBattleLocaleSlice(battle);
            // 从 battle 再提取一份 en 基座，避免 deepCopy 与 zh 共享引用导致 overlay 污染中文
            Map<String, Object> en = extractBattleLocaleSlice(battle);
            Object overlay = battlesEnOverlay.get(id.toString());
            if (overlay instanceof Map) {
                mergeBattleLocaleSlice(en, (Map<String, Object>) overlay);
            }
            Map<String, Object> locales = new LinkedHashMap<>();
            locales.put("zh", zh);
            locales.put("en", en);
            Map<String, Object> template = new LinkedHashMap<>();
            template.put("id", id);
            template.put("locales", locales);
            templates.add(template);
        }
        return List.copyOf(templates);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> buildBilingualPhilosophersTemplate() {
        List<Map<String, Object>> basePhilosophers = (List<Map<String, Object>>) catalogBase.get("philosophers");
        if (basePhilosophers == null) {
            return List.of();
        }
        List<Map<String, Object>> templates = new ArrayList<>();
        for (Map<String, Object> philosopher : basePhilosophers) {
            Object id = philosopher.get("id");
            if (id == null) {
                continue;
            }
            Map<String, Object> zh = extractPhilosopherLocaleSlice(philosopher);
            Map<String, Object> en = extractPhilosopherLocaleSlice(philosopher);
            Object overlay = philosophersEnOverlay.get(id.toString());
            if (overlay instanceof Map) {
                mergePhilosopherLocaleSlice(en, (Map<String, Object>) overlay);
            }
            Map<String, Object> locales = new LinkedHashMap<>();
            locales.put("zh", zh);
            locales.put("en", en);
            Map<String, Object> template = new LinkedHashMap<>();
            template.put("id", id);
            for (String key : List.of("name", "nameCN", "region", "period", "influences")) {
                if (philosopher.get(key) != null) {
                    template.put(key, philosopher.get(key));
                }
            }
            template.put("locales", locales);
            templates.add(template);
        }
        return List.copyOf(templates);
    }

    private List<Map<String, Object>> localizePhilosophers(String locale) {
        String key = normalizeLocale(locale);
        List<Map<String, Object>> philosophers = new ArrayList<>();
        for (Map<String, Object> template : bilingualPhilosophersTemplate) {
            philosophers.add(materializePhilosopherForLocale(template, key));
        }
        return philosophers;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> materializePhilosopherForLocale(Map<String, Object> template, String locale) {
        Map<String, Object> philosopher = new LinkedHashMap<>();
        for (String key : List.of("id", "name", "nameCN", "region", "period", "influences")) {
            if (template.get(key) != null) {
                philosopher.put(key, template.get(key));
            }
        }
        Map<String, Object> localesCopy = deepCopyMap((Map<String, Object>) template.get("locales"));
        philosopher.put("locales", localesCopy);
        Map<String, Object> slice = (Map<String, Object>) localesCopy.get(locale);
        if (slice == null) {
            slice = (Map<String, Object>) localesCopy.get("zh");
        }
        if (slice != null) {
            philosopher.putAll(slice);
        }
        return philosopher;
    }

    private Map<String, Object> extractPhilosopherLocaleSlice(Map<String, Object> philosopher) {
        Map<String, Object> slice = new LinkedHashMap<>();
        for (String key : List.of("school", "summary", "birthPlace", "lifespan")) {
            Object value = philosopher.get(key);
            if (value != null) {
                slice.put(key, value);
            }
        }
        copyListField(philosopher, slice, "keyIdeas");
        copyListField(philosopher, slice, "majorWorks");
        copyListField(philosopher, slice, "famousQuotes");
        return slice;
    }

    private void copyListField(Map<String, Object> source, Map<String, Object> target, String key) {
        Object value = source.get(key);
        if (value instanceof List) {
            target.put(key, new ArrayList<>((List<?>) value));
        }
    }

    private void mergePhilosopherLocaleSlice(Map<String, Object> target, Map<String, Object> overlay) {
        for (String key : List.of("school", "summary", "birthPlace", "lifespan")) {
            Object value = overlay.get(key);
            if (value != null) {
                target.put(key, value);
            }
        }
        copyListField(overlay, target, "keyIdeas");
        copyListField(overlay, target, "majorWorks");
        copyListField(overlay, target, "famousQuotes");
    }

    private List<Map<String, Object>> localizeBattles(String locale) {
        String key = normalizeLocale(locale);
        List<Map<String, Object>> battles = new ArrayList<>();
        for (Map<String, Object> template : bilingualBattlesTemplate) {
            battles.add(materializeBattleForLocale(template, key));
        }
        return battles;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> materializeBattleForLocale(Map<String, Object> template, String locale) {
        Map<String, Object> battle = new LinkedHashMap<>();
        battle.put("id", template.get("id"));
        Map<String, Object> localesCopy = deepCopyMap((Map<String, Object>) template.get("locales"));
        battle.put("locales", localesCopy);
        Map<String, Object> slice = (Map<String, Object>) localesCopy.get(locale);
        if (slice == null) {
            slice = (Map<String, Object>) localesCopy.get("zh");
        }
        if (slice != null) {
            battle.putAll(slice);
        }
        return battle;
    }

    private Map<String, Object> extractBattleLocaleSlice(Map<String, Object> battle) {
        Map<String, Object> slice = new LinkedHashMap<>();
        for (String key : List.of("question", "category", "builderView", "breakerView", "reveal")) {
            Object value = battle.get(key);
            if (value != null) {
                slice.put(key, value);
            }
        }
        Object judge = battle.get("judgeQuestions");
        if (judge instanceof List) {
            slice.put("judgeQuestions", new ArrayList<>((List<?>) judge));
        }
        return slice;
    }

    private void mergeBattleLocaleSlice(Map<String, Object> target, Map<String, Object> overlay) {
        for (String key : List.of("question", "category", "builderView", "breakerView", "reveal")) {
            Object value = overlay.get(key);
            if (value != null) {
                target.put(key, value);
            }
        }
        if (overlay.get("judgeQuestions") instanceof List) {
            target.put("judgeQuestions", new ArrayList<>((List<?>) overlay.get("judgeQuestions")));
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> deepCopyMap(Map<String, Object> source) {
        return objectMapper.convertValue(source, Map.class);
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

    /** @deprecated use {@link #getCatalog(String)} */
    public Map<String, Object> getCatalog() {
        return getCatalog("en");
    }

    public Map<String, Object> getProfile() {
        return profile;
    }
}
