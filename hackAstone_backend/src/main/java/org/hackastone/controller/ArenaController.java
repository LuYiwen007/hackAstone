package org.hackastone.controller;

import org.hackastone.base.util.Result;
import org.hackastone.biz.ArenaDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/arena")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ArenaController {

    @Autowired
    private ArenaDataService arenaDataService;

    /**
     * 认知竞技场静态数据：思想家、地区、时间轴、学科辩题、哲学辩题文案
     */
    @GetMapping("/catalog")
    public Result<Map<String, Object>> catalog() {
        return Result.success(arenaDataService.getCatalog());
    }

    /**
     * 思维画像（当前为演示数据，后续可对齐用户与对局统计）
     */
    @GetMapping("/profile")
    public Result<Map<String, Object>> profile() {
        return Result.success(arenaDataService.getProfile());
    }
}
