package org.hackastone.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    /** 本地开发常见前端端口（含 Vite 默认 5173、本项目 8081；8082–8084 为 Vite 占线时曾自动选用的端口） */
    private static final String[] LOCAL_DEV_ORIGINS = {
            "http://localhost:8081", "http://127.0.0.1:8081",
            "http://localhost:8082", "http://127.0.0.1:8082",
            "http://localhost:8083", "http://127.0.0.1:8083",
            "http://localhost:8084", "http://127.0.0.1:8084",
            "http://localhost:5173", "http://127.0.0.1:5173",
            "http://localhost:3000", "http://127.0.0.1:3000",
    };

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(LOCAL_DEV_ORIGINS)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }
}
