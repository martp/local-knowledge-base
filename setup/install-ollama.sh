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
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 Detected macOS - using Homebrew installation"
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            echo "📥 Homebrew not found. Installing Ollama manually..."
            # Download and install Ollama for macOS
            curl -L https://ollama.ai/download/Ollama-darwin.zip -o /tmp/Ollama-darwin.zip
            unzip /tmp/Ollama-darwin.zip -d /tmp/
            sudo mv /tmp/Ollama.app /Applications/
            # Add to PATH
            echo 'export PATH="/Applications/Ollama.app/Contents/Resources:$PATH"' >> ~/.zshrc
            export PATH="/Applications/Ollama.app/Contents/Resources:$PATH"
            rm /tmp/Ollama-darwin.zip
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "🐧 Detected Linux - using official installer"
        curl -fsSL https://ollama.ai/install.sh | sh
    else
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "Please install Ollama manually from https://ollama.ai/download"
        exit 1
    fi
    
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