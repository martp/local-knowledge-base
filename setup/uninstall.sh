#!/bin/bash

set -e

echo "🗑️  Local Knowledge Base - Complete Uninstall"
echo "==========================================="
echo ""
echo "⚠️  WARNING: This will remove:"
echo "   • All Docker containers and volumes"
echo "   • All crawled content and uploaded documents"
echo "   • All logs and quality tracking data"
echo "   • Ollama and downloaded models (optional)"
echo "   • All configuration files"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Uninstall cancelled"
    exit 0
fi

echo ""
echo "🔄 Starting uninstall process..."
echo ""

# 1. Stop and remove Docker containers
echo "🐳 Stopping Docker services..."
if command -v docker-compose &> /dev/null; then
    docker-compose down -v 2>/dev/null || true
    echo "✅ Docker services stopped"
else
    echo "⏭️  Docker Compose not found, skipping"
fi

# 2. Remove Docker volumes and data
echo ""
echo "📦 Removing Docker volumes and data..."
docker volume rm local-knowledge-base_qdrant-data 2>/dev/null || true
docker volume rm local-knowledge-base_webui-data 2>/dev/null || true
echo "✅ Docker volumes removed"

# 3. Remove local data directories
echo ""
echo "📁 Removing local data directories..."
directories=(
    "./qdrant-data"
    "./webui-data"
    "./crawled-content"
    "./logs"
    "./quality-export-*.csv"
)

for dir in "${directories[@]}"; do
    if [ -e "$dir" ]; then
        rm -rf "$dir"
        echo "   ✅ Removed: $dir"
    fi
done

# 4. Remove environment files
echo ""
echo "🔐 Removing configuration files..."
if [ -f ".env" ]; then
    rm .env
    echo "   ✅ Removed: .env"
fi

# 5. Remove cron jobs
echo ""
echo "⏰ Removing scheduled tasks..."
if crontab -l 2>/dev/null | grep -q "update-knowledge-base.sh"; then
    crontab -l | grep -v "update-knowledge-base.sh" | crontab -
    echo "✅ Removed cron jobs"
else
    echo "⏭️  No cron jobs found"
fi

# 6. Ask about Ollama
echo ""
echo "🤖 Ollama and Models"
echo "==================="
if command -v ollama &> /dev/null; then
    # Show current models and their sizes
    echo "Current Ollama models:"
    ollama list
    echo ""
    read -p "Do you want to remove Ollama and all models? (yes/no): " remove_ollama
    
    if [ "$remove_ollama" == "yes" ]; then
        # Remove models first
        echo "🗑️  Removing Ollama models..."
        ollama rm llama3.1:8b 2>/dev/null || true
        ollama rm deepseek-coder:6.7b 2>/dev/null || true
        ollama rm nomic-embed-text 2>/dev/null || true
        
        # Stop Ollama
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "🛑 Stopping Ollama on macOS..."
            pkill -x ollama 2>/dev/null || true
            osascript -e 'quit app "Ollama"' 2>/dev/null || true
            
            # Remove from Applications
            if [ -e "/Applications/Ollama.app" ]; then
                echo "🗑️  Removing Ollama.app..."
                sudo rm -rf "/Applications/Ollama.app"
                echo "✅ Ollama.app removed"
            fi
            
            # Remove Ollama data
            rm -rf ~/Library/Application\ Support/Ollama 2>/dev/null || true
            
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "🛑 Stopping Ollama on Linux..."
            sudo systemctl stop ollama 2>/dev/null || true
            sudo systemctl disable ollama 2>/dev/null || true
            
            # Uninstall Ollama
            if [ -f "/usr/local/bin/ollama" ]; then
                sudo rm /usr/local/bin/ollama
                echo "✅ Ollama binary removed"
            fi
            
            # Remove Ollama data
            sudo rm -rf /usr/share/ollama 2>/dev/null || true
            rm -rf ~/.ollama 2>/dev/null || true
        fi
        
        echo "✅ Ollama and models removed"
    else
        echo "⏭️  Keeping Ollama and models"
    fi
else
    echo "⏭️  Ollama not found"
fi

# 7. Clean up Docker (optional)
echo ""
echo "🐳 Docker Cleanup"
echo "================"
echo "Your Docker system may have leftover images and caches."
read -p "Do you want to run Docker system prune? (yes/no): " docker_prune

if [ "$docker_prune" == "yes" ]; then
    echo "🧹 Cleaning Docker system..."
    docker system prune -a -f
    echo "✅ Docker cleanup complete"
else
    echo "⏭️  Skipping Docker cleanup"
fi

# 8. Final cleanup
echo ""
echo "🧹 Final cleanup..."

# Remove any Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

# Remove node_modules if exists
if [ -d "node_modules" ]; then
    echo "📦 Removing node_modules..."
    rm -rf node_modules
    echo "✅ node_modules removed"
fi

echo ""
echo "✅ Uninstall Complete!"
echo "====================="
echo ""
echo "The following have been removed:"
echo "✓ Docker containers and volumes"
echo "✓ Local data directories"
echo "✓ Configuration files"
echo "✓ Scheduled tasks"
if [ "$remove_ollama" == "yes" ]; then
    echo "✓ Ollama and models"
fi
echo ""
echo "The following remain:"
echo "• Source code and documentation"
echo "• Git repository"
if [ "$remove_ollama" != "yes" ] && command -v ollama &> /dev/null; then
    echo "• Ollama and models"
fi
echo ""
echo "To completely remove the project, delete this directory:"
echo "  rm -rf $(pwd)"
echo ""
echo "Thank you for using Local Knowledge Base! 👋"