#!/bin/bash
set -e

echo "🚀 Soynativo Git Setup для macOS"
echo "================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Detect if running interactively (terminal) or piped (curl|bash)
if [ -t 0 ]; then
    INTERACTIVE=1
else
    INTERACTIVE=0
fi

# 1. Git
echo "1️⃣  Git..."
if ! command -v git &> /dev/null; then
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install git
fi
echo -e "${GREEN}✓ $(git --version)${NC}"
echo ""

# 2. Git identity (skip if already set or non-interactive)
echo "2️⃣  Git identity..."
EXISTING_NAME=$(git config --global user.name || echo "")
EXISTING_EMAIL=$(git config --global user.email || echo "")

if [ -n "$EXISTING_NAME" ] && [ -n "$EXISTING_EMAIL" ]; then
    echo -e "${GREEN}✓ Уже настроено: $EXISTING_NAME <$EXISTING_EMAIL>${NC}"
elif [ "$INTERACTIVE" = "1" ]; then
    read -p "Имя: " USER_NAME
    read -p "Email: " USER_EMAIL
    git config --global user.name "$USER_NAME"
    git config --global user.email "$USER_EMAIL"
    echo -e "${GREEN}✓ Настроено${NC}"
else
    echo -e "${YELLOW}⚠ Запусти потом: git config --global user.name 'Имя' && git config --global user.email 'mail@example.com'${NC}"
fi

git config --global init.defaultBranch main
git config --global pull.rebase false
echo ""

# 3. SSH ключ
echo "3️⃣  SSH ключ..."
SSH_KEY="$HOME/.ssh/id_ed25519"
if [ -f "$SSH_KEY" ]; then
    echo -e "${GREEN}✓ Существует${NC}"
else
    EMAIL_FOR_KEY=$(git config --global user.email || echo "user@local")
    ssh-keygen -t ed25519 -C "$EMAIL_FOR_KEY" -f "$SSH_KEY" -N ""
    echo -e "${GREEN}✓ Создан${NC}"
fi
echo ""

# 4. known_hosts (надёжная версия для всех ключей GitHub)
echo "4️⃣  GitHub в known_hosts..."
mkdir -p ~/.ssh
touch ~/.ssh/known_hosts
if ! grep -q "github.com" ~/.ssh/known_hosts; then
    ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
fi
echo -e "${GREEN}✓ Готово${NC}"
echo ""

# 5. Показать публичный ключ
echo "5️⃣  Твой публичный SSH ключ:"
echo "---"
cat "$SSH_KEY.pub"
echo "---"
echo ""
echo -e "${YELLOW}Если ещё не добавил — добавь его в GitHub:${NC}"
echo "  https://github.com/settings/keys"
echo ""

# 6. Клонировать (это и есть проверка SSH)
echo "6️⃣  Клонирование soynativo-app..."
CLONE_PATH="$HOME/Projects"
mkdir -p "$CLONE_PATH"
cd "$CLONE_PATH"

if [ -d "soynativo-app/.git" ]; then
    echo -e "${GREEN}✓ Репо уже клонирован в $CLONE_PATH/soynativo-app${NC}"
    cd soynativo-app
    git fetch origin
    echo -e "${GREEN}✓ Обновлён${NC}"
else
    if git clone git@github.com:vasylievmarko-debug/soynativo-app.git; then
        cd soynativo-app
        echo -e "${GREEN}✓ Клонирован${NC}"
    else
        echo -e "${RED}✗ Не удалось клонировать.${NC}"
        echo ""
        echo "Проверь что:"
        echo "  1. SSH ключ добавлен в GitHub (https://github.com/settings/keys)"
        echo "  2. Команда работает: ssh -T git@github.com"
        exit 1
    fi
fi
echo ""

# 7. Yarn
echo "7️⃣  Yarn..."
if ! command -v yarn &> /dev/null; then
    npm install -g yarn
fi
echo -e "${GREEN}✓ $(yarn --version)${NC}"
echo ""

# 8. Установить зависимости
echo "8️⃣  yarn install..."
yarn install
echo ""

echo "================================="
echo -e "${GREEN}✅ Всё готово!${NC}"
echo ""
echo "Папка проекта: $CLONE_PATH/soynativo-app"
echo ""
echo "cd $CLONE_PATH/soynativo-app"
echo "git status"
