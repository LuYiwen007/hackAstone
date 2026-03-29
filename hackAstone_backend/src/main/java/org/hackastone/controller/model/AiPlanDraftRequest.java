package org.hackastone.controller.model;

import lombok.Data;
import java.util.List;

@Data
public class AiPlanDraftRequest {
    private String planName;
    private String planSubtitle;
    private String totalDuration;
    private String dailyStudyTime;
    private List<AiPlanStageDto> stages;
}
