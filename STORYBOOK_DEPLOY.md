# Storybook Deploy на GitHub Pages

Стorybook автоматически деплоится на GitHub Pages при каждом пуше в `main` или `develop`.

## Первоначальная настройка (один раз)

### 1. Включить GitHub Pages в репо

1. Откройте репо на GitHub
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: **gh-pages** / **/ (root)**
5. Save

GitHub автоматически создаст `gh-pages` branch при первом запуске workflow.

### 2. Дождаться первого деплоя

- Workflow запустится автоматически на основной ветке
- Проверить статус: Actions → "Deploy Storybook to GitHub Pages"
- После успеха GitHub Pages будет доступен по адресу:
  ```
  https://<username>.github.io/<repo-name>
  ```

### 3. (Опционально) Custom domain

1. Settings → Pages
2. Custom domain: `design.soynativo.com` (или твой домен)
3. Добавить CNAME запись в DNS:
   ```
   CNAME design soynativo.github.io
   ```
4. Enforce HTTPS (автоматически)

## Как работает

**Trigger:** 
- Пуш в `main` или `develop`
- Изменения в `apps/storybook/**` или `apps/mobile/src/shared/ui/**`
- Или ручной запуск (Actions → Run workflow)

**Что происходит:**
1. Checkout кода
2. Setup Node 18 + install зависимостей
3. `yarn workspace @soynativo/storybook build-storybook`
4. Загрузить `storybook-static/` на GitHub Pages
5. Автоматически обновляется на сайте

**Время сборки:** ~3-5 минут

## Мониторинг

1. GitHub → Actions
2. "Deploy Storybook to GitHub Pages"
3. Зелёная галочка = успешно
4. Красный крест = ошибка в сборке (см. логи)

## Локальная разработка

```bash
# Просмотр локально перед пушем
yarn workspace @soynativo/storybook storybook

# Сборка статики (то же что делает workflow)
yarn workspace @soynativo/storybook build-storybook

# Результат: apps/storybook/storybook-static/
```

## Troubleshooting

**Q: Storybook не обновляется после пуша**
- Проверить Actions → посмотреть логи workflow
- Может быть ошибка в сборке (например, импорт не найден)

**Q: 404 при открытии custom domain**
- Подождать 24 часа на распространение DNS
- Проверить что CNAME запись корректна

**Q: Workflow не запускается**
- Проверить что файлы изменились в `apps/storybook/` или `apps/mobile/src/shared/ui/`
- Или запустить вручную: Actions → Deploy Storybook → Run workflow

## CI/CD интеграция

Workflow не блокирует мерж в main. Даже если Storybook не собирается, PR всё равно можно мержить. Но стоит исправить ошибку перед этим.

Добавить обязательность успешного Storybook деплоя можно в Settings → Branch protection rules.

## Статус бейдж (опционально)

Добавить в README.md:

```markdown
[![Deploy Storybook](https://github.com/<user>/<repo>/actions/workflows/storybook-deploy.yml/badge.svg)](https://github.com/<user>/<repo>/actions/workflows/storybook-deploy.yml)
```
