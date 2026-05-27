package org.hackastone.base.util.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

public class JwtUtil {

    // 为了简化演示，使用固定密钥。生产环境应通过配置注入并保密
    private static final String SECRET = "hackAstone-secret-key-for-jwt-signing-2024";
    private static final long EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7天

    private static final Key KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public static String generateToken(String userId, String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);
        return Jwts.builder()
                .setSubject(userId)
                .claim("username", username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public static String extractUserId(String token) {
        return parseToken(token).getSubject();
    }

    public static boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
