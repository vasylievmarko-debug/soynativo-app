# ADR-0004: Хранение токенов и секретов

**Status:** Accepted
**Date:** 2026-04-27

## Decision

**Mobile (iOS/Android):**
- JWT access + refresh токены — в **expo-secure-store** (iOS Keychain / Android Keystore). Никогда в AsyncStorage / MMKV — там данные доступны при rooted/jailbroken устройстве.
- Конфиг приложения (apiUrl, sentryDsn) — в `EXPO_PUBLIC_*` env vars, инлайнится при сборке.

**Backend:**
- Все секреты — через переменные окружения, валидируются Zod-схемой при старте (`config/env.ts`). Если секрет отсутствует или невалиден — процесс не стартует.
- В `.env.example` — только плейсхолдеры. Реальные значения никогда не коммитятся.
- В production — секреты приходят из секрет-менеджера (AWS Secrets Manager / GCP Secret Manager / Doppler / Vault) и инжектятся в контейнер.

**JWT:**
- Access token — короткоживущий (15m), bearer в заголовке.
- Refresh token — длинный (30d), отдельный секрет для подписи. На мобильном клиенте — single-flight refresh: при 401 первый запрос рефрешит, остальные ждут результата.
- Логи редактируются через pino redact paths — токены и пароли заменяются на `[REDACTED]`.

## Future work

- **Token revocation:** добавить Redis blocklist по `jti` при logout/смене пароля. Сейчас logout — только клиентская очистка, что приемлемо для access TTL=15m, но недостаточно для security-incident response.
- **Refresh token rotation:** при каждом refresh выдавать новый refresh, инвалидируя старый. Защита от кражи long-lived токена.
