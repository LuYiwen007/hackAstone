package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@Service
public class ArenaDataService implements InitializingBean {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private Map<String, Object> catalog;
    private Map<String, Object> profile;

    @Override
    public void afterPropertiesSet() throws Exception {
        catalog = readResourceMap("arena/catalog.json");
        profile = readResourceMap("arena/profile.json");
    }

    private Map<String, Object> readResourceMap(String classpathLocation) throws IOException {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(classpathLocation)) {
            if (in == null) {
                throw new IllegalStateException("Classpath resource missing: " + classpathLocation);
            }
            return objectMapper.readValue(in, new TypeReference<Map<String, Object>>() {});
        }
    }

    public Map<String, Object> getCatalog() {
        return catalog;
    }

    public Map<String, Object> getProfile() {
        return profile;
    }
}
