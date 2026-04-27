# Maestro E2E

Maestro — декларативный E2E-фреймворк для мобильных приложений: один YAML-флоу работает и на iOS, и на Android, не требует кода и хорошо ладит с Expo.

## Установка

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Запуск на iPhone 14 Pro Max

```bash
# Сборка приложения для iOS-устройства (один раз)
yarn workspace @soynativo/mobile build:ios

# Запустить флоу
maestro test apps/mobile/maestro/login.yaml

# Запустить все флоу
maestro test apps/mobile/maestro/
```

## Что писать как E2E

E2E медленные и хрупкие — не дублируй ими unit/integration. Пиши только **золотые пути**, которые продают продукт:

- логин и регистрация ученика;
- бронирование урока;
- старт видеозвонка;
- получение Telegram-уведомления (через мок).

Edge-cases и валидации покрывай unit/integration тестами.

## Selectors: правила

- Предпочитай `accessibilityText` (он же `accessibilityLabel` в RN) и видимый `text`.
- Никогда не полагайся на координаты (`tapOn: { point: [x, y] }`) — сломается при изменении дизайна.
- Если элемент динамический — добавь стабильный `accessibilityLabel` в компонент.
