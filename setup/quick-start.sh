#!/bin/bash

set -e

echo "🚀 Local Knowledge Base - Quick Start"
echo "====================================="
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"
echo ""

# Setup environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. You can customize it later for authenticated crawling."
fi

# Install Ollama if not present
if ! command -v ollama &> /dev/null; then
    echo "📥 Ollama not found. Running installation..."
    ./setup/install-ollama.sh
else
    echo "✅ Ollama is already installed"
    
    # Check if required models are available
    echo "🔍 Checking required models..."
    
    models_needed=()
    if ! ollama list | grep -q "llama3.1:8b"; then
        models_needed+=("llama3.1:8b")
    fi
    if ! ollama list | grep -q "deepseek-coder:6.7b"; then
        models_needed+=("deepseek-coder:6.7b")
    fi
    if ! ollama list | grep -q "nomic-embed-text"; then
        models_needed+=("nomic-embed-text")
    fi
    
    if [ ${#models_needed[@]} -gt 0 ]; then
        echo "📥 Downloading missing models: ${models_needed[*]}"
        for model in "${models_needed[@]}"; do
            echo "🔄 Downloading $model..."
            ollama pull "$model"
        done
    else
        echo "✅ All required models are available"
    fi
fi

echo ""
echo "🐳 Starting Local Knowledge Base services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services started successfully!"
    echo ""
    echo "🎉 Your Local Knowledge Base is ready!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit http://localhost:3000 to access the web interface"
    echo "2. Create your account on first visit"
    echo "3. Upload your first documents:"
    echo "   • API documentation you reference frequently"
    echo "   • Internal coding standards and best practices"
    echo "   • Architecture decisions and design docs"
    echo "   • Troubleshooting guides and runbooks"
    echo ""
    echo "💡 Model Usage Tips:"
    echo "• Use 'deepseek-coder:6.7b' for code questions and debugging"
    echo "• Use 'llama3.1:8b' for general questions and architecture"
    echo ""
    echo "🔧 Useful commands:"
    echo "• View logs: docker-compose logs -f"
    echo "• Stop services: docker-compose down"
    echo "• Restart services: docker-compose restart"
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker-compose logs"
fi