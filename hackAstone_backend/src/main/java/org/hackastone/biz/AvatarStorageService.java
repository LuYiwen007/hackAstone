package org.hackastone.biz;

import org.hackastone.base.util.constants.ResultEnum;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;

@Service
public class AvatarStorageService {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    @Value("${hackastone.upload.dir:./data/uploads}")
    private String uploadDir;

    @Value("${hackastone.upload.max-avatar-bytes:2097152}")
    private long maxAvatarBytes;

    /**
     * 保存头像并返回可写入 ha_user.avatar_url 的相对路径（含 context-path 前缀 /api）。
     */
    public String storeAvatar(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "请选择头像文件");
        }
        if (file.getSize() > maxAvatarBytes) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "头像不能超过 2MB");
        }
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !ALLOWED.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "仅支持 JPEG、PNG、WebP、GIF");
        }
        String ext = extensionFor(contentType);
        try {
            Path dir = Paths.get(uploadDir, "avatars").toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(safeFileName(userId) + ext);
            file.transferTo(target.toFile());
            return "/uploads/avatars/" + safeFileName(userId) + ext;
        } catch (IOException e) {
            throw new HackAstoneBizException(ResultEnum.SYSTEM_ERROR.getCode(), "头像保存失败");
        }
    }

    public Path resolveUploadRoot() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    private static String safeFileName(String userId) {
        return userId.replaceAll("[^a-zA-Z0-9_-]", "");
    }

    private static String extensionFor(String contentType) {
        switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png":
                return ".png";
            case "image/webp":
                return ".webp";
            case "image/gif":
                return ".gif";
            default:
                return ".jpg";
        }
    }
}
