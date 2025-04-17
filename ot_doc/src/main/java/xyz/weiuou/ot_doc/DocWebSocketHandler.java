package xyz.weiuou.ot_doc;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import jakarta.annotation.PostConstruct;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class DocWebSocketHandler extends TextWebSocketHandler {
    private static final Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());
    private static StringRedisTemplate redisTemplate;
    private static final String DOC_KEY = "otdoc:content";

    @Autowired
    private StringRedisTemplate autowiredRedisTemplate;

    @PostConstruct
    public void init() {
        redisTemplate = autowiredRedisTemplate;
        // 初始化时如果没有内容，写入默认内容
        if (redisTemplate.opsForValue().get(DOC_KEY) == null) {
            redisTemplate.opsForValue().set(DOC_KEY, "**Hello Markdown!**");
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            // 这里假设前端每次都发完整内容（可根据实际协议调整）
            // 你可以根据操作类型解析并更新 docContent
            // 这里只做简单处理，实际可用更复杂的 OT 算法
            // 这里建议前端在每次操作后都同步 POST 一份完整内容
        } catch (Exception e) {
            // 忽略解析异常
        }
        synchronized (sessions) {
            for (WebSocketSession s : sessions) {
                if (s.isOpen() && !s.getId().equals(session.getId())) {
                    s.sendMessage(message);
                }
            }
        }
    }
}
