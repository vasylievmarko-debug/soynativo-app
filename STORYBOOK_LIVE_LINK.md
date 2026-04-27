# Как получить живую ссылку на Storybook

После пуша последних изменений Storybook будет доступен по адресу:

```
https://vasylievmarko-debug.github.io/soynativo-app/
```

(если репозиторий называется именно так — замени на свой если отличается)

---

## Что нужно сделать ОДИН РАЗ в GitHub UI

### Шаг 1: Включить GitHub Pages

1. Открой репозиторий на GitHub
2. **Settings** (кнопка в правом верхнем меню репо)
3. В левом меню выбери **Pages**
4. В разделе **Build and deployment**:
   - **Source**: выбери **GitHub Actions** (НЕ "Deploy from a branch")
5. Нажми **Save** (если появилась кнопка)

### Шаг 2: Дождаться первой сборки

1. После того как я запушу код, в репо появится Actions tab
2. Кликни **Actions** в верхнем меню
3. Найди workflow **"Deploy Storybook to GitHub Pages"**
4. Жди пока желтый кружок не станет зелёной галочкой ✅
   - Сборка занимает ~5-7 минут на первом запуске
5. Если зелёная галочка — Storybook задеплоился

### Шаг 3: Открыть Storybook

1. После успешной сборки иди обратно в **Settings → Pages**
2. Сверху появится: **"Your site is live at https://...github.io/..."**
3. Это твоя ссылка. Сохрани в закладки.

---

## Что увидишь на ссылке

Веб-приложение с панелями:
- **Левая панель** — список компонентов:
  - Atoms: Button, Input, Text, Avatar, Screen, Spinner, Skeleton
  - Molecules: Card, List
  - Organisms: EmptyState
  - Components: LessonCard
- **Центр** — превью компонента
- **Правая панель** — Controls (можно крутить пропсы — variant, size, label)
- **Верхняя панель** — переключатель темы (light/dark), viewport (mobile/tablet/desktop)

---

## Когда обновляется автоматически

Storybook пересобирается и деплоится при каждом push в:
- ветку `main`
- ветку `develop`
- любую ветку начинающуюся с `claude/`

То есть: я пушу изменения в `claude/language-learning-app-LWdbd` → через 5-7 минут ссылка обновляется новой версией.

---

## Если первая сборка упала

**Это вероятно**, потому что Storybook + react-native-web — сложная интеграция, и я не мог проверить её локально в своём sandbox (нет node_modules, нет браузера для тестирования).

**Что делать если упало:**

1. В Actions кликни на красный workflow run
2. Раскрой шаги — найди какой именно упал
3. Скопируй текст ошибки
4. Пришли мне — я исправлю

**Возможные проблемы первого запуска:**
- ❌ `Cannot find module 'react-native-reanimated'` — нужно добавить mock в Storybook config
- ❌ `Cannot find module 'expo-image'` — то же самое  
- ❌ `Cannot resolve '@soynativo/design-tokens'` — нужно добавить в storybook tsconfig paths
- ❌ `yarn.lock is missing` — workflow без `--immutable` (исправлено)

---

## Если хочешь домен покрасивее (не обязательно)

Например `design.soynativo.com` вместо `vasylievmarko-debug.github.io/soynativo-app`:

1. Купи домен (если ещё нет)
2. В Settings → Pages → **Custom domain** введи `design.soynativo.com`
3. У DNS-провайдера твоего домена добавь CNAME запись:
   ```
   design  →  vasylievmarko-debug.github.io
   ```
4. Подожди до 24 часов на распространение DNS
5. В GitHub Pages поставь галочку **Enforce HTTPS**

Это только эстетика — на работу Storybook не влияет.

---

## Резюме

✅ **Один раз**: Settings → Pages → Source: GitHub Actions  
✅ **Ждать**: первый workflow run (5-7 минут)  
✅ **Готово**: ссылка появится в Settings → Pages  

Если что-то падает — скажи, исправлю.
