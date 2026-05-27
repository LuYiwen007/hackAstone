package org.hackastone.config;

import org.hackastone.biz.AvatarStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    @Autowired
    private AvatarStorageService avatarStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = avatarStorageService.resolveUploadRoot().toUri().toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
