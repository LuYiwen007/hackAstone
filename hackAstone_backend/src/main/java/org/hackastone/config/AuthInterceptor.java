package org.hackastone.config;

import io.jsonwebtoken.Claims;
import org.hackastone.base.util.auth.JwtUtil;
import org.hackastone.base.util.auth.UserContext;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (JwtUtil.validateToken(token)) {
                Claims claims = JwtUtil.parseToken(token);
                String userId = claims.getSubject();
                UserContext.setCurrentUserId(userId);
            }
        }
        // 对于不需要登录的接口（如 catalog、i18n），即使没有 token 也放行
        // 需要登录的接口在 Controller 层自行判断 UserContext.getCurrentUserId()
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }
}
