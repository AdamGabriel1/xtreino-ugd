#!/bin/bash

# ============================================================
# Universal Clean Script (Linux/Ubuntu)
# Remove arquivos temporários, caches e dependências
# Funciona com: Python, Node.js, Next.js, React, Java, Go, Rust, etc.
# ============================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

REMOVED_DIRS=0
REMOVED_FILES=0
SAVED_SPACE=0

# ============================================================
# Funções utilitárias
# ============================================================

calc_size() {
    if [ -e "$1" ]; then
        du -sb "$1" 2>/dev/null | cut -f1 || echo 0
    else
        echo 0
    fi
}

remove_item() {
    local path="$1"
    local desc="$2"

    if [ -e "$path" ]; then
        local size=$(calc_size "$path")
        SAVED_SPACE=$((SAVED_SPACE + size))

        if [ -d "$path" ]; then
            rm -rf "$path"
            REMOVED_DIRS=$((REMOVED_DIRS + 1))
            echo -e "  ${RED}🗑️  ${desc}${NC}"
        else
            rm -f "$path"
            REMOVED_FILES=$((REMOVED_FILES + 1))
            echo -e "  ${RED}🗑️  ${desc}${NC}"
        fi
    fi
}

remove_pattern() {
    local pattern="$1"
    local desc="$2"
    local search_dir="${3:-.}"

    find "$search_dir" -type f -name "$pattern" 2>/dev/null | while read file; do
        remove_item "$file" "$desc: $(basename "$file")"
    done
}

remove_dirs_pattern() {
    local pattern="$1"
    local desc="$2"
    local search_dir="${3:-.}"

    find "$search_dir" -type d -name "$pattern" 2>/dev/null | while read dir; do
        remove_item "$dir" "$desc: $(basename $(dirname "$dir"))/$(basename "$dir")"
    done
}

# ============================================================
# Início
# ============================================================

echo -e "${BLUE}🧹 Universal Clean Script${NC}"
echo -e "${BLUE}   Remove caches, builds e dependências de qualquer projeto${NC}"
echo ""

# Verificar se bc está instalado (para cálculo de espaço)
if ! command -v bc &> /dev/null; then
    echo -e "${YELLOW}⚠️  'bc' não encontrado. Instalando...${NC}"
    sudo apt-get update -qq && sudo apt-get install -y -qq bc
fi

# ============================================================
# PYTHON
# ============================================================

echo -e "${CYAN}🐍 Python${NC}"
echo ""

# Ambientes virtuais
remove_dirs_pattern "venv" "venv"
remove_dirs_pattern ".venv" ".venv"
remove_dirs_pattern "env" "env"
remove_dirs_pattern ".env" ".env"

# Caches
remove_dirs_pattern "__pycache__" "__pycache__"
remove_dirs_pattern ".pytest_cache" "pytest cache"
remove_dirs_pattern ".mypy_cache" "mypy cache"
remove_dirs_pattern ".ruff_cache" "ruff cache"
remove_dirs_pattern ".hypothesis" "hypothesis cache"
remove_dirs_pattern ".tox" "tox environments"

# Arquivos compilados
remove_pattern "*.pyc" "pyc"
remove_pattern "*.pyo" "pyo"
remove_pattern "*.pyd" "pyd"
remove_pattern "*.so" "so"
remove_pattern "*.egg" "egg"

# Dist/build
remove_dirs_pattern "*.egg-info" "egg-info"
remove_item "dist" "dist (raiz)"
remove_item "build" "build (raiz)"
remove_dirs_pattern "dist" "dist"
remove_dirs_pattern "build" "build"
remove_item ".eggs" ".eggs"

# Coverage e testes
remove_item ".coverage" ".coverage"
remove_item "coverage.xml" "coverage.xml"
remove_item "htmlcov" "htmlcov"
remove_item ".nyc_output" ".nyc_output"

# ============================================================
# NODE.JS / JAVASCRIPT / TYPESCRIPT
# ============================================================

echo ""
echo -e "${CYAN}📦 Node.js / JavaScript / TypeScript${NC}"
echo ""

# Dependências
remove_item "node_modules" "node_modules (raiz)"
remove_dirs_pattern "node_modules" "node_modules"

# Locks (opcional - mantenha comentado se não quiser)
# remove_pattern "package-lock.json" "package-lock"
# remove_pattern "yarn.lock" "yarn.lock"
# remove_pattern "pnpm-lock.yaml" "pnpm-lock"

# Builds
remove_item ".next" ".next (Next.js build)"
remove_item "out" "out (Next.js export)"
remove_item "dist" "dist (build)"
remove_item "build" "build (build)"
remove_item ".nuxt" ".nuxt (Nuxt)"
remove_item ".output" ".output (Nuxt)"
remove_item ".svelte-kit" ".svelte-kit (SvelteKit)"
remove_item ".astro" ".astro (Astro)"
remove_item ".expo" ".expo (Expo)"
remove_item "web-build" "web-build (Expo)"

# Caches
remove_item ".turbo" ".turbo"
remove_item ".parcel-cache" ".parcel-cache"
remove_item ".cache" ".cache"
remove_item ".eslintcache" ".eslintcache"
remove_item ".stylelintcache" ".stylelintcache"
remove_item "tsconfig.tsbuildinfo" "tsconfig.tsbuildinfo"

# ============================================================
# JAVA / JVM
# ============================================================

echo ""
echo -e "${CYAN}☕ Java / JVM${NC}"
echo ""

remove_item "target" "target (Maven)"
remove_item ".gradle" ".gradle"
remove_item "gradle" "gradle (wrapper)"
remove_item "build" "build (Gradle)"
remove_dirs_pattern "target" "target"
remove_dirs_pattern ".gradle" ".gradle"
remove_dirs_pattern "build" "build (Gradle)"
remove_pattern "*.class" "class"
remove_pattern "*.jar" "jar"
remove_pattern "*.war" "war"

# ============================================================
# GO
# ============================================================

echo ""
echo -e "${CYAN}🐹 Go${NC}"
echo ""

remove_item "bin" "bin (Go)"
remove_dirs_pattern "bin" "bin"

# ============================================================
# RUST
# ============================================================

echo ""
echo -e "${CYAN}🦀 Rust${NC}"
echo ""

remove_item "target" "target (Rust)"
remove_dirs_pattern "target" "target (Rust)"
remove_pattern "*.rlib" "rlib"

# ============================================================
# C / C++
# ============================================================

echo ""
echo -e "${CYAN}🔧 C / C++${NC}"
echo ""

remove_item "cmake-build-debug" "cmake-build-debug"
remove_item "cmake-build-release" "cmake-build-release"
remove_dirs_pattern "cmake-build-*" "cmake build"
remove_item "CMakeCache.txt" "CMakeCache.txt"
remove_dirs_pattern "CMakeFiles" "CMakeFiles"
remove_pattern "*.o" "object file"
remove_pattern "*.obj" "object file"
remove_pattern "*.a" "static lib"
remove_pattern "*.so" "shared lib"
remove_pattern "*.dll" "DLL"
remove_pattern "*.exe" "executable"

# ============================================================
# DOCKER
# ============================================================

echo ""
echo -e "${CYAN}🐳 Docker${NC}"
echo ""

# Perguntar antes de limpar Docker (pode ser perigoso)
if command -v docker &> /dev/null; then
    echo -e "  ${YELLOW}⚠️  Docker detectado. Limpar imagens/volumes/containers órfãos?${NC}"
    echo -e "  ${YELLOW}   (s/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo -e "  ${CYAN}Limpando Docker...${NC}"
        docker system prune -f 2>/dev/null && echo -e "  ${GREEN}✅ Docker limpo${NC}" || echo -e "  ${RED}❌ Erro ao limpar Docker${NC}"
        docker volume prune -f 2>/dev/null && echo -e "  ${GREEN}✅ Volumes limpos${NC}" || true
    else
        echo -e "  ${CYAN}⏭️  Pulando Docker${NC}"
    fi
fi

# ============================================================
# ARQUIVOS GERAIS
# ============================================================

echo ""
echo -e "${CYAN}📁 Arquivos gerais${NC}"
echo ""

# Logs
remove_pattern "*.log" "log"
remove_pattern "npm-debug.log*" "npm debug"
remove_pattern "yarn-debug.log*" "yarn debug"
remove_pattern "yarn-error.log*" "yarn error"
remove_pattern "pnpm-debug.log*" "pnpm debug"

# Sistema operacional
remove_pattern ".DS_Store" ".DS_Store"
remove_pattern "Thumbs.db" "Thumbs.db"
remove_pattern "desktop.ini" "desktop.ini"

# Editores
remove_pattern "*.swp" "vim swap"
remove_pattern "*.swo" "vim swap"
remove_pattern "*.swn" "vim swap"
remove_pattern "*~" "backup"
remove_pattern "*.bak" "backup"
remove_pattern "*.tmp" "tmp"

# IDEs
remove_item ".idea" ".idea (IntelliJ)"
remove_item "*.code-workspace" "workspace"
remove_item ".settings" ".settings (Eclipse)"
remove_item ".project" ".project (Eclipse)"
remove_item ".classpath" ".classpath (Eclipse)"

# ============================================================
# RESUMO
# ============================================================

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Limpeza concluída!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Converter bytes para formato legível
if command -v bc &> /dev/null; then
    if [ $SAVED_SPACE -ge 1073741824 ]; then
        SPACE_STR="$(echo "scale=2; $SAVED_SPACE / 1073741824" | bc) GB"
    elif [ $SAVED_SPACE -ge 1048576 ]; then
        SPACE_STR="$(echo "scale=2; $SAVED_SPACE / 1048576" | bc) MB"
    elif [ $SAVED_SPACE -ge 1024 ]; then
        SPACE_STR="$(echo "scale=2; $SAVED_SPACE / 1024" | bc) KB"
    else
        SPACE_STR="$SAVED_SPACE bytes"
    fi
else
    SPACE_STR="$SAVED_SPACE bytes (instale 'bc' para formato legível)"
fi

echo -e "  ${YELLOW}Diretórios removidos:${NC} $REMOVED_DIRS"
echo -e "  ${YELLOW}Arquivos removidos:${NC}   $REMOVED_FILES"
echo -e "  ${YELLOW}Espaço liberado:${NC}     $SPACE_STR"
echo ""

# Detectar tipo de projeto e sugerir comando
if [ -f "package.json" ] && [ -f "requirements.txt" ]; then
    echo -e "  ${MAGENTA}📋 Projeto detectado: Fullstack (Python + Node.js)${NC}"
    echo -e "  ${CYAN}Para reinstalar:${NC}"
    echo -e "  ${GREEN}  cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt${NC}"
    echo -e "  ${GREEN}  cd frontend && npm install${NC}"
elif [ -f "package.json" ]; then
    echo -e "  ${MAGENTA}📋 Projeto detectado: Node.js${NC}"
    echo -e "  ${CYAN}Para reinstalar:${NC} ${GREEN}npm install${NC}"
elif [ -f "requirements.txt" ]; then
    echo -e "  ${MAGENTA}📋 Projeto detectado: Python${NC}"
    echo -e "  ${CYAN}Para reinstalar:${NC} ${GREEN}python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt${NC}"
elif [ -f "pom.xml" ]; then
    echo -e "  ${MAGENTA}📋 Projeto detectado: Java (Maven)${NC}"
    echo -e "  ${CYAN}Para reinstalar:${NC} ${GREEN}mvn clean install${NC}"
elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
    echo -e "  ${MAGENTA}📋 Projeto detectado: Java/Kotlin (Gradle)${NC}"
    echo -e "  ${CYAN}Para reinstalar:${NC} ${GREEN}gradle build${NC}"
elif [ -f "go.mod" ]; then
    echo -e "  ${MAGENTA}📋 Projeto detectado: Go${NC}"
    echo -e "  ${CYAN}Para reinstalar:${NC} ${GREEN}go mod download${NC}"
elif [ -f "Cargo.toml" ]; then
    echo -e "  ${MAGENTA}📋 Projeto detectado: Rust${NC}"
    echo -e "  ${CYAN}Para reinstalar:${NC} ${GREEN}cargo build${NC}"
fi

echo ""
