package org.hackastone;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("org.hackastone.base.dal.mapper")
public class HackAstoneApplication {
    public static void main(String[] args) {
        SpringApplication.run(HackAstoneApplication.class, args);
    }
}