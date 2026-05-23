package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hackastone.base.dal.entity.BattleRecordEntity;
import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.dal.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
public class UserProfileService {

    private static final String[][] BIAS_TEMPLATE_KEYS = {
            {"confirmation", "bg-red-500"},
            {"authority", "bg-orange-500"},
            {"overconfidence", "bg-yellow-500"},
            {"counterexample", "bg-red-500"},
            {"binary", "bg-orange-500"},
    };

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private BattleRecordService battleRecordService;

    @Autowired
    private ArenaDataService arenaDataService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @SuppressWarnings("unchecked")
    public Map<String, Object> getOrCreateProfile(String userId, String locale) {
        String loc = arenaDataService.normalizeLocale(locale);
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            return buildEmptyProfile(loc);
        }

        int totalBattles = battleRecordService.getTotalCount(userId);
        int changedStance = battleRecordService.getChangedStanceCount(userId);
        List<BattleRecordEntity> recentRecords = battleRecordService.getRecentRecords(userId, 10);

        List<Map<String, String>> stats = new ArrayList<>();
        stats.add(createStatValue("battles", String.valueOf(totalBattles)));
        stats.add(createStatValue("changed", String.valueOf(changedStance)));
        stats.add(createStatValue("blindspots", String.valueOf(calculateBlindspots(totalBattles, changedStance))));
        stats.add(createStatValue("accuracy", calculateAccuracy(totalBattles)));

        List<Map<String, Object>> recentBattles = new ArrayList<>();
        for (BattleRecordEntity record : recentRecords) {
            Map<String, String> display = resolveLocalizedDisplay(record, loc);
            Map<String, Object> battle = new LinkedHashMap<>();
            battle.put("question", display.get("question"));
            battle.put("choice", display.get("choice"));
            battle.put("judgeComment", display.get("judgeComment"));
            battle.put("changed", record.getChangedStance() != null && record.getChangedStance() == 1);
            recentBattles.add(battle);
        }

        List<Map<String, Object>> biases = generateBiasesFromRecords(totalBattles, userId, loc);

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("stats", stats);
        profile.put("biases", biases);
        profile.put("recentBattles", recentBattles);
        return profile;
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> resolveLocalizedDisplay(BattleRecordEntity record, String locale) {
        Map<String, String> display = new LinkedHashMap<>();
        display.put("question", safe(record.getTopic()));
        display.put("choice", safe(record.getUserChoice()));
        display.put("judgeComment", safe(record.getJudgeSummary()));

        if (StringUtils.hasText(record.getMessages())) {
            try {
                Object parsed = objectMapper.readValue(record.getMessages(), Object.class);
                if (parsed instanceof Map) {
                    Map<?, ?> root = (Map<?, ?>) parsed;
                    Object i18n = root.get("profileI18n");
                    if (i18n instanceof Map) {
                        Map<?, ?> i18nMap = (Map<?, ?>) i18n;
                        Object slice = i18nMap.get(locale);
                        if (slice instanceof Map) {
                            Map<?, ?> sliceMap = (Map<?, ?>) slice;
                            display.put("question", pickSlice(sliceMap, "topic", display.get("question")));
                            display.put("choice", pickSlice(sliceMap, "userChoice", display.get("choice")));
                            display.put("judgeComment", pickSlice(sliceMap, "judgeSummary", display.get("judgeComment")));
                            return display;
                        }
                    }
                }
            } catch (Exception ignored) {
                /* fall through */
            }
        }

        if ("en".equals(locale)) {
            applyLegacyDilemmaLookup(display);
        }
        return display;
    }

    private String pickSlice(Map<?, ?> slice, String key, String fallback) {
        Object v = slice.get(key);
        if (v == null) return fallback;
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? fallback : s;
    }

    private void applyLegacyDilemmaLookup(Map<String, String> display) {
        Map<String, String> zh = arenaDataService.getI18nStrings("zh");
        Map<String, String> en = arenaDataService.getI18nStrings("en");
        String topic = display.get("question");
        String choice = display.get("choice");

        for (Map.Entry<String, String> e : zh.entrySet()) {
            String k = e.getKey();
            if (!k.startsWith("dilemma.case.") || !k.endsWith(".title")) continue;
            if (!topic.equals(e.getValue())) continue;
            String prefix = k.substring(0, k.length() - ".title".length());
            display.put("question", en.getOrDefault(prefix + ".title", topic));
            for (Map.Entry<String, String> opt : zh.entrySet()) {
                String ok = opt.getKey();
                if (!ok.startsWith(prefix + ".option.") || !ok.endsWith(".label")) continue;
                if (choice.equals(opt.getValue())) {
                    display.put("choice", en.getOrDefault(ok, choice));
                    break;
                }
            }
            break;
        }
    }

    private String i18n(String locale, String key) {
        Map<String, String> strings = arenaDataService.getI18nStrings(locale);
        return strings.getOrDefault(key, key);
    }

    private int calculateBlindspots(int totalBattles, int changedStance) {
        if (totalBattles == 0) return 0;
        int base = Math.max(0, totalBattles - changedStance * 2);
        return Math.min(base, 15);
    }

    private String calculateAccuracy(int totalBattles) {
        if (totalBattles == 0) return "--";
        int accuracy = 50 + Math.min(40, totalBattles * 3);
        return accuracy + "%";
    }

    private List<Map<String, Object>> generateBiasesFromRecords(int totalBattles, String userId, String locale) {
        if (totalBattles == 0) {
            return new ArrayList<>();
        }
        int seed = userId.hashCode();
        Random random = new Random(seed);

        List<Map<String, Object>> biases = new ArrayList<>();
        int count = Math.min(3 + random.nextInt(3), BIAS_TEMPLATE_KEYS.length);
        for (int i = 0; i < count; i++) {
            String biasKey = BIAS_TEMPLATE_KEYS[i][0];
            String color = BIAS_TEMPLATE_KEYS[i][1];
            Map<String, Object> bias = new LinkedHashMap<>();
            bias.put("name", i18n(locale, "profile.bias." + biasKey + ".name"));
            bias.put("description", i18n(locale, "profile.bias." + biasKey + ".desc"));
            bias.put("color", color);
            int basePercentage = 30 + random.nextInt(31);
            int percentage = Math.min(95, basePercentage + totalBattles * 2);
            bias.put("percentage", percentage);
            bias.put("instances", 1 + random.nextInt(Math.max(2, totalBattles + 1)));
            biases.add(bias);
        }
        return biases;
    }

    private Map<String, String> createStatValue(String labelKey, String value) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("label", labelKey);
        m.put("value", value);
        return m;
    }

    private Map<String, Object> buildEmptyProfile(String locale) {
        Map<String, Object> profile = new LinkedHashMap<>();
        List<Map<String, String>> stats = new ArrayList<>();
        stats.add(createStatValue("battles", "0"));
        stats.add(createStatValue("changed", "0"));
        stats.add(createStatValue("blindspots", "0"));
        stats.add(createStatValue("accuracy", "--"));
        profile.put("stats", stats);
        profile.put("biases", new ArrayList<>());
        profile.put("recentBattles", new ArrayList<>());
        return profile;
    }

    private static String safe(String s) {
        if (s == null || s.trim().isEmpty()) return "--";
        return s.trim();
    }
}
