package com.devflow.auth.infrastructure.redis;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Refresh token store with Redis primary + in-memory fallback.
 * When Redis is unavailable (local dev without Docker), tokens are stored
 * in a ConcurrentHashMap. This is NOT suitable for production (multi-instance).
 */
@Component
@Slf4j
public class RefreshTokenStore {

    private static final String PREFIX    = "rt:";
    private static final String BLACKLIST = "blacklist:";
    private static final Duration REFRESH_TTL = Duration.ofDays(7);

    @Autowired(required = false)
    private StringRedisTemplate redis;

    // In-memory fallback for local dev (no Redis)
    private final ConcurrentHashMap<String, String> tokenMap      = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long>   blacklistMap  = new ConcurrentHashMap<>();

    public void save(String userId, String refreshToken) {
        if (redis != null) {
            try {
                redis.opsForValue().set(PREFIX + userId, refreshToken, REFRESH_TTL);
                return;
            } catch (Exception ex) {
                log.warn("[DEV-MODE] Redis unavailable, using in-memory token store: {}", ex.getMessage());
            }
        }
        tokenMap.put(userId, refreshToken);
    }

    public boolean isValid(String userId, String refreshToken) {
        if (redis != null) {
            try {
                String stored = redis.opsForValue().get(PREFIX + userId);
                return stored != null && stored.equals(refreshToken);
            } catch (Exception ex) {
                log.warn("[DEV-MODE] Redis unavailable, checking in-memory store");
            }
        }
        return refreshToken.equals(tokenMap.get(userId));
    }

    public void rotate(String userId, String newRefreshToken) {
        save(userId, newRefreshToken);
    }

    public void revoke(String userId) {
        if (redis != null) {
            try {
                redis.delete(PREFIX + userId);
                return;
            } catch (Exception ex) {
                log.warn("[DEV-MODE] Redis unavailable, revoking from in-memory store");
            }
        }
        tokenMap.remove(userId);
    }

    public void blacklistToken(String accessToken, long ttlMs) {
        if (redis != null) {
            try {
                redis.opsForValue().set(
                        BLACKLIST + accessToken,
                        "revoked",
                        Duration.ofMillis(ttlMs)
                );
                return;
            } catch (Exception ex) {
                log.warn("[DEV-MODE] Redis unavailable, blacklisting in memory");
            }
        }
        blacklistMap.put(accessToken, System.currentTimeMillis() + ttlMs);
    }

    public boolean isBlacklisted(String token) {
        if (redis != null) {
            try {
                return Boolean.TRUE.equals(redis.hasKey(BLACKLIST + token));
            } catch (Exception ex) {
                log.warn("[DEV-MODE] Redis unavailable, checking in-memory blacklist");
            }
        }
        Long expiry = blacklistMap.get(token);
        if (expiry == null) return false;
        if (System.currentTimeMillis() > expiry) {
            blacklistMap.remove(token);
            return false;
        }
        return true;
    }
}
