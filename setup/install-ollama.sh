#!/bin/bash

set -e

echo "🚀 Local Knowledge Base - Ollama Setup"
echo "======================================"
echo ""

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed"
    ollama --version
else
    echo "📥 Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    echo "✅ Ollama installed successfully"
fi

echo ""
echo "📋 Downloading required models..."
echo "This will take several minutes depending on your internet connection."
echo ""

# Download the models that matter for quality (from spec)
echo "🔄 Downloading llama3.1:8b (general model)..."
ollama pull llama3.1:8b

echo "🔄 Downloading deepseek-coder:6.7b (THE game-changer for dev questions)..."
ollama pull deepseek-coder:6.7b

echo "🔄 Downloading nomic-embed-text (better embeddings than OpenAI)..."
ollama pull nomic-embed-text

echo ""
echo "✅ Model downloads complete!"
echo ""

# Verify installation
echo "📋 Verifying installation..."
echo "Available models:"
ollama list

echo ""
echo "✅ Ollama setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'docker-compose up -d' to start the knowledge base"
echo "2. Visit http://localhost:3000 to access the web interface"
echo "3. Upload your first documents to get started"