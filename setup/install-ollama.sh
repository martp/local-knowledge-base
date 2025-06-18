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
        echo "🚀 Checking Ollama status..."
        
        # Check if Ollama server is responding
        if ! curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
            echo "📱 Starting Ollama app..."
            open -a "Ollama"
            
            echo "⏳ Waiting for Ollama server to start..."
            for i in {1..60}; do
                if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
                    echo ""
                    echo "✅ Ollama server is ready!"
                    break
                fi
                echo -n "."
                sleep 1
                
                # After 10 seconds, try launching again in case first attempt failed
                if [ $i -eq 10 ]; then
                    echo ""
                    echo "🔄 Retrying Ollama launch..."
                    open -a "Ollama" 2>/dev/null || true
                fi
                
                # After 30 seconds, provide troubleshooting tips
                if [ $i -eq 30 ]; then
                    echo ""
                    echo "⚠️  Ollama is taking longer than expected to start..."
                    echo "   You may need to:"
                    echo "   1. Check if Ollama app is in your Applications folder"
                    echo "   2. Try starting Ollama manually from Applications"
                    echo "   3. Check Activity Monitor for any Ollama processes"
                fi
            done
            
            # Final check
            if ! curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
                echo ""
                echo "❌ Ollama server is not responding after 60 seconds"
                echo ""
                echo "🔧 Troubleshooting steps:"
                echo "1. Open Ollama manually from /Applications/Ollama.app"
                echo "2. Check if macOS is blocking the app (System Settings > Privacy & Security)"
                echo "3. Try running: killall ollama && open -a Ollama"
                echo "4. Check Console.app for any Ollama-related errors"
                echo ""
                echo "Once Ollama is running, you can continue with:"
                echo "  ollama pull llama3.1:8b"
                echo "  ollama pull deepseek-coder:6.7b"
                echo "  ollama pull nomic-embed-text"
                exit 1
            fi
        else
            echo "✅ Ollama server is already running"
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