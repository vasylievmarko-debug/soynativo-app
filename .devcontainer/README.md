# Soynativo Development Container

Облачная среда разработки для работы с проектом с любого устройства.

## 🚀 Быстрый старт

### Открыть в GitHub Codespaces

1. Перейди на GitHub репозиторий
2. Нажми зелёную кнопку **"Code"**
3. Выбери **"Codespaces"** → **"Create codespace on main"**
4. Дождись инициализации (~2-3 минуты)

### Или открыть в VS Code

```bash
# Локально (если хочешь работать как обычно)
git clone https://github.com/твойреп/soynativo-app
cd soynativo-app
code .
```

## 📋 Что включено

- ✅ Node.js 20
- ✅ PostgreSQL 16
- ✅ Redis 7
- ✅ Docker (для контейнеризации)
- ✅ Git
- ✅ Все зависимости Node (yarn)

## 🔧 Первые команды после открытия

После того как Codespace загрузится (~3-5 минут):

```bash
# 1. Применить миграции БД
yarn workspace @soynativo/backend migration:run

# 2. Заполнить БД тестовыми данными
yarn workspace @soynativo/backend seed

# 3. Запустить backend
yarn workspace @soynativo/backend dev

# 4. В отдельном терминале — запустить мобильное приложение
yarn workspace @soynativo/mobile start
```

## 📱 Использование с разных устройств

### На iPhone / iPad
- Открыть https://github.com/твойреп/soynativo-app
- Кнопка Code → Codespaces → Open in browser
- Полнофункциональный VS Code в браузере

### На другом ноутбуке
- Можешь просто открыть URL Codespace в браузере
- Или клонировать репо и работать локально

## 🎯 Команды разработки

```bash
# Backend
yarn workspace @soynativo/backend dev              # Dev сервер
yarn workspace @soynativo/backend build            # Build
yarn workspace @soynativo/backend test             # Unit-тесты
yarn workspace @soynativo/backend type-check       # Type-check
yarn workspace @soynativo/backend migration:run    # Применить миграции
yarn workspace @soynativo/backend seed             # Заполнить БД

# Mobile
yarn workspace @soynativo/mobile start             # Expo dev
yarn workspace @soynativo/mobile build:ios         # Build iOS
yarn workspace @soynativo/mobile build:android     # Build Android

# Storybook
yarn workspace @soynativo/storybook storybook      # Dev
yarn workspace @soynativo/storybook build-storybook # Build

# Все
yarn lint                   # Lint все
yarn type-check             # Type-check все
yarn build                  # Build все
```

## 🗄️ БД и Redis

Автоматически запускаются при старте Codespace.

```bash
# Подключиться к PostgreSQL
psql -h postgres -U soynativo -d soynativo

# Проверить Redis
redis-cli -h redis ping
```

## 💡 Советы

- **Не коммитить `.env`** — он генерируется автоматически
- **Codespace заснёт после неактивности** — просто открыть URL снова
- **Первый запуск ~ 5 минут** — последующие быстрее
- **Можешь работать одновременно с нескольких устройств** — используется облако GitHub

## 🆘 Проблемы?

Если что-то не работает:

```bash
# 1. Проверить сервисы
pg_isready -h postgres
redis-cli -h redis ping

# 2. Пересоздать .env
bash .devcontainer/post-start.sh

# 3. Переоткрыть Codespace
# Меню → Codespaces → Stop → Open → Start
```

---

Happy coding! 🎉
