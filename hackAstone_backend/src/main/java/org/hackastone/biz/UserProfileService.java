package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hackastone.base.dal.entity.BattleRecordEntity;
import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.dal.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserProfileService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private BattleRecordService battleRecordService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @SuppressWarnings("unchecked")
    public Map<String, Object> getOrCreateProfile(String userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            return buildEmptyProfile();
        }

        // 从对局记录表查询真实数据
        int totalBattles = battleRecordService.getTotalCount(userId);
        int changedStance = battleRecordService.getChangedStanceCount(userId);
        List<BattleRecordEntity> recentRecords = battleRecordService.getRecentRecords(userId, 10);

        // 构建 stats
        List<Map<String, String>> stats = new ArrayList<>();
        stats.add(createStatValue("已完成对局", String.valueOf(totalBattles)));
        stats.add(createStatValue("改变立场次数", String.valueOf(changedStance)));
        stats.add(createStatValue("思维盲区", String.valueOf(calculateBlindspots(totalBattles, changedStance))));
        stats.add(createStatValue("准确判断率", calculateAccuracy(totalBattles)));

        // 构建 recentBattles
        List<Map<String, Object>> recentBattles = new ArrayList<>();
        for (BattleRecordEntity record : recentRecords) {
            Map<String, Object> battle = new LinkedHashMap<>();
            battle.put("question", record.getTopic());
            battle.put("choice", record.getUserChoice() != null ? record.getUserChoice() : "--");
            battle.put("judgeComment", record.getJudgeSummary() != null ? record.getJudgeSummary() : "--");
            battle.put("changed", record.getChangedStance() != null && record.getChangedStance() == 1);
            recentBattles.add(battle);
        }

        // 构建 biases（基于对局记录数做简单模拟，后续可接入 AI 分析）
        List<Map<String, Object>> biases = generateBiasesFromRecords(totalBattles, userId);

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("stats", stats);
        profile.put("biases", biases);
        profile.put("recentBattles", recentBattles);
        return profile;
    }

    private int calculateBlindspots(int totalBattles, int changedStance) {
        if (totalBattles == 0) return 0;
        // 简单规则：对局越多、改变立场越少，盲区越多
        int base = Math.max(0, totalBattles - changedStance * 2);
        return Math.min(base, 15);
    }

    private String calculateAccuracy(int totalBattles) {
        if (totalBattles == 0) return "--";
        // 简单规则：对局越多，准确率趋近于 50%~90%
        int accuracy = 50 + Math.min(40, totalBattles * 3);
        return accuracy + "%";
    }

    private List<Map<String, Object>> generateBiasesFromRecords(int totalBattles, String userId) {
        if (totalBattles == 0) {
            return new ArrayList<>();
        }
        // 基于 userId hash 生成固定的偏差组合，但对局越多偏差值越高
        int seed = userId.hashCode();
        Random random = new Random(seed);

        List<Map<String, Object>> biases = new ArrayList<>();
        String[][] templates = {
                {"确认偏差", "倾向于寻找支持已有观点的证据", "bg-red-500"},
                {"权威依赖", "容易被权威或逻辑清晰的论述说服", "bg-orange-500"},
                {"过度自信", "在不确定的情况下表现出过高的确定性", "bg-yellow-500"},
                {"忽略反例", "倾向于忽视与观点相悖的案例", "bg-red-500"},
                {"二元思维", "倾向于用非黑即白的方式看待问题", "bg-orange-500"},
        };

        int count = Math.min(3 + random.nextInt(3), templates.length);
        for (int i = 0; i < count; i++) {
            Map<String, Object> bias = new LinkedHashMap<>();
            bias.put("name", templates[i][0]);
            bias.put("description", templates[i][1]);
            bias.put("color", templates[i][2]);
            int basePercentage = 30 + random.nextInt(31); // 30~60
            int percentage = Math.min(95, basePercentage + totalBattles * 2);
            bias.put("percentage", percentage);
            bias.put("instances", 1 + random.nextInt(Math.max(2, totalBattles + 1)));
            biases.add(bias);
        }
        return biases;
    }

    private Map<String, String> createStatValue(String label, String value) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("label", label);
        m.put("value", value);
        return m;
    }

    private Map<String, Object> buildEmptyProfile() {
        Map<String, Object> profile = new LinkedHashMap<>();
        List<Map<String, String>> stats = new ArrayList<>();
        stats.add(createStatValue("已完成对局", "0"));
        stats.add(createStatValue("改变立场次数", "0"));
        stats.add(createStatValue("思维盲区", "0"));
        stats.add(createStatValue("准确判断率", "--"));
        profile.put("stats", stats);
        profile.put("biases", new ArrayList<>());
        profile.put("recentBattles", new ArrayList<>());
        return profile;
    }
}
