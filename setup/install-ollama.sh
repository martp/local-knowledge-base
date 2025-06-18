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
        echo "🍎 Detected macOS"
        
        # Check if Ollama.app exists
        if [ -e "/Applications/Ollama.app" ]; then
            echo "✅ Ollama.app already installed"
        else
            echo "📥 Downloading Ollama for macOS..."
            # Download the official macOS installer
            curl -L https://ollama.ai/download/Ollama-darwin.dmg -o /tmp/Ollama-darwin.dmg
            
            echo "🔧 Installing Ollama..."
            # Mount the DMG
            hdiutil attach /tmp/Ollama-darwin.dmg -nobrowse -quiet
            
            # Copy to Applications
            cp -R "/Volumes/Ollama/Ollama.app" /Applications/
            
            # Unmount
            hdiutil detach "/Volumes/Ollama" -quiet
            
            # Clean up
            rm /tmp/Ollama-darwin.dmg
            
            echo "✅ Ollama.app installed to /Applications"
        fi
        
        # Start Ollama if not running
        echo "🚀 Starting Ollama..."
        if ! pgrep -x "ollama" > /dev/null; then
            open -a "Ollama"
            echo "⏳ Waiting for Ollama to start..."
            sleep 5
            
            # Wait for Ollama to be ready
            for i in {1..30}; do
                if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
                    echo "✅ Ollama is running"
                    break
                fi
                echo -n "."
                sleep 1
            done
            echo ""
        else
            echo "✅ Ollama is already running"
        fi
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "🐧 Detected Linux - using official installer"
        curl -fsSL https://ollama.ai/install.sh | sh
        
        # Start Ollama service on Linux
        if command -v systemctl &> /dev/null; then
            sudo systemctl start ollama 2>/dev/null || true
        fi
    else
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "Please install Ollama manually from https://ollama.ai/download"
        exit 1
    fi
    
    echo "✅ Ollama installation complete"
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