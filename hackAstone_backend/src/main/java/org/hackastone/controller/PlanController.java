package org.hackastone.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hackastone.base.dal.entity.PlanEntity;
import org.hackastone.base.dal.mapper.PlanMapper;
import org.hackastone.base.util.Result;
import org.hackastone.base.util.template.BizTemplate;
import org.hackastone.controller.model.AiPlanDraftRequest;
import org.hackastone.controller.model.AiPlanDraftResponse;
import org.hackastone.controller.model.AiPlanStageDto;
import org.hackastone.core.component.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/plan")
public class PlanController {

    @Autowired
    private PlanMapper planMapper;

    @Autowired
    private IdGenerator idGenerator;

    @Autowired
    private BizTemplate bizTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String AI_DRAFT_USER_ID = "guest";

    /**
     * 保存 AI 生成的学习计划草稿（储存与拆分）
     * POST /plan/ai-draft
     */
    @PostMapping("/ai-draft")
    public Result<AiPlanDraftResponse> saveAiPlanDraft(@RequestBody AiPlanDraftRequest request) {
        return bizTemplate.execute(() -> {
            String planId = idGenerator.generate("PLN", "PLN");
            PlanEntity entity = new PlanEntity();
            entity.setId(planId);
            entity.setUserId(AI_DRAFT_USER_ID);
            entity.setTitle(request.getPlanName());
            entity.setDescription(request.getPlanSubtitle());
            entity.setPlanType("AI_DRAFT");
            Map<String, Object> ext = new HashMap<>();
            ext.put("totalDuration", request.getTotalDuration());
            ext.put("dailyStudyTime", request.getDailyStudyTime());
            ext.put("stages", request.getStages());
            try {
                entity.setExtInfo(objectMapper.writeValueAsString(ext));
            } catch (JsonProcessingException e) {
                throw new org.hackastone.base.util.exception.HackAstoneBizException("计划扩展信息序列化失败");
            }
            planMapper.insert(entity);
            AiPlanDraftResponse resp = new AiPlanDraftResponse();
            resp.setId(planId);
            resp.setPlanName(request.getPlanName());
            resp.setPlanSubtitle(request.getPlanSubtitle());
            resp.setTotalDuration(request.getTotalDuration());
            resp.setDailyStudyTime(request.getDailyStudyTime());
            resp.setStages(request.getStages());
            return resp;
        });
    }

    /**
     * 获取 AI 计划草稿（供前端预览）
     * GET /plan/ai-draft/{id}
     */
    @GetMapping("/ai-draft/{id}")
    public Result<AiPlanDraftResponse> getAiPlanDraft(@PathVariable String id) {
        return bizTemplate.execute(() -> {
            PlanEntity entity = planMapper.selectById(id);
            if (entity == null) {
                throw new org.hackastone.base.util.exception.HackAstoneBizException("计划不存在");
            }
            AiPlanDraftResponse resp = new AiPlanDraftResponse();
            resp.setId(entity.getId());
            resp.setPlanName(entity.getTitle());
            resp.setPlanSubtitle(entity.getDescription());
            resp.setTotalDuration(null);
            resp.setDailyStudyTime(null);
            resp.setStages(null);
            if (entity.getExtInfo() != null && !entity.getExtInfo().isEmpty()) {
                try {
                    Map<String, Object> ext = objectMapper.readValue(entity.getExtInfo(), new TypeReference<Map<String, Object>>() {});
                    resp.setTotalDuration(ext.get("totalDuration") != null ? ext.get("totalDuration").toString() : null);
                    resp.setDailyStudyTime(ext.get("dailyStudyTime") != null ? ext.get("dailyStudyTime").toString() : null);
                    Object stagesObj = ext.get("stages");
                    if (stagesObj != null) {
                        List<AiPlanStageDto> stages = objectMapper.convertValue(stagesObj, new TypeReference<List<AiPlanStageDto>>() {});
                        resp.setStages(stages);
                    }
                } catch (IOException e) {
                    throw new org.hackastone.base.util.exception.HackAstoneBizException("计划扩展信息解析失败");
                }
            }
            return resp;
        });
    }
}
