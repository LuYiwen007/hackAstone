package org.hackastone.controller;

import org.hackastone.base.util.Result;
import org.hackastone.core.component.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestIdController {

    @Autowired
    private IdGenerator idGenerator;

    @GetMapping("/test/id")
    public Result<String> testId() {
        // 测试生成一个用户ID
        // "USR" 是你数据库 id_sequence 表里的一行数据
        return Result.success(idGenerator.generate("USR", "USR"));
    }
}