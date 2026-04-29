#!/bin/bash
set -e

echo "🚀 Soynativo Git Setup для macOS"
echo "================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Проверить и установить Git
echo "1️⃣  Проверка Git..."
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Git не найден. Устанавливаю...${NC}"

    # Проверить Homebrew
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}Homebrew не найден. Устанавливаю Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    brew install git
    echo -e "${GREEN}✓ Git установлен${NC}"
else
    echo -e "${GREEN}✓ Git уже установлен$(git --version)${NC}"
fi

echo ""

# 2. Настроить Git identity
echo "2️⃣  Настройка Git identity..."
read -p "Введи своё имя: " USER_NAME
read -p "Введи свой email: " USER_EMAIL

git config --global user.name "$USER_NAME"
git config --global user.email "$USER_EMAIL"
git config --global init.defaultBranch main
git config --global pull.rebase false

echo -e "${GREEN}✓ Git identity настроена${NC}"
echo ""

# 3. Создать SSH ключ
echo "3️⃣  SSH ключи..."
SSH_KEY_PATH="$HOME/.ssh/id_ed25519"

if [ -f "$SSH_KEY_PATH" ]; then
    echo -e "${GREEN}✓ SSH ключ уже существует${NC}"
else
    echo -e "${YELLOW}Создаю новый SSH ключ...${NC}"
    ssh-keygen -t ed25519 -C "$USER_EMAIL" -f "$SSH_KEY_PATH" -N ""
    echo -e "${GREEN}✓ SSH ключ создан${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Скопируй этот публичный ключ в GitHub:${NC}"
echo "https://github.com/settings/keys → New SSH key"
echo ""
cat "$SSH_KEY_PATH.pub"
echo ""
echo -e "${YELLOW}Нажми Enter когда добавишь ключ в GitHub...${NC}"
read

# 4. Добавить GitHub в known_hosts
echo ""
echo "4️⃣  Добавляю GitHub в known_hosts..."
mkdir -p ~/.ssh
ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts 2>/dev/null || true
echo -e "${GREEN}✓ GitHub добавлен${NC}"

# 5. Проверить SSH подключение
echo ""
echo "5️⃣  Проверка SSH подключения..."
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo -e "${GREEN}✓ SSH подключение работает!${NC}"
else
    echo -e "${RED}✗ SSH подключение не работает${NC}"
    echo "Убедись что ключ добавлен в GitHub (может потребоваться 1-2 минуты)"
    echo "Попробуем ещё раз..."
    sleep 2
    ssh -T git@github.com
fi

echo ""

# 6. Клонировать репозиторий
echo "6️⃣  Клонирование репозитория..."
read -p "Где клонировать? (по умолчанию ~/Projects): " CLONE_PATH
CLONE_PATH=${CLONE_PATH:-~/Projects}

mkdir -p "$CLONE_PATH"
cd "$CLONE_PATH"

if [ -d "soynativo-app" ]; then
    echo -e "${YELLOW}Папка soynativo-app уже существует${NC}"
    cd soynativo-app
else
    git clone git@github.com:vasylievmarko-debug/soynativo-app.git
    cd soynativo-app
    echo -e "${GREEN}✓ Репозиторий клонирован${NC}"
fi

echo ""

# 7. Установить зависимости
echo "7️⃣  Установка зависимостей (yarn)..."
if command -v yarn &> /dev/null; then
    echo -e "${GREEN}✓ Yarn уже установлен$(yarn --version)${NC}"
else
    echo -e "${YELLOW}Yarn не найден. Устанавливаю...${NC}"
    npm install -g yarn
fi

yarn install
echo -e "${GREEN}✓ Зависимости установлены${NC}"

echo ""
echo "================================="
echo -e "${GREEN}✅ Всё готово!${NC}"
echo ""
echo "Твоя локальная копия находится в:"
echo "  $CLONE_PATH/soynativo-app"
echo ""
echo "Следующие шаги:"
echo "  1. cd $CLONE_PATH/soynativo-app"
echo "  2. git status  # проверить статус"
echo "  3. git log --oneline -5  # посмотреть коммиты"
echo ""
echo "Готово для разработки! 🎉"
