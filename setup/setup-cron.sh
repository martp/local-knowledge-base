#!/bin/bash

set -e

echo "⏰ Local Knowledge Base - Cron Job Setup"
echo "========================================"
echo ""

# Get the current directory (where the project is located)
PROJECT_DIR=$(pwd)

echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Create update script
echo "📝 Creating automated update script..."

cat > update-knowledge-base.sh << EOF
#!/bin/bash

# Local Knowledge Base - Automated Update Script
# Generated on $(date)

cd "$PROJECT_DIR"

echo "\$(date): Starting knowledge base update..." >> ./logs/update.log

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Run the crawler
echo "\$(date): Running simple crawler..." >> ./logs/update.log
npm run crawl >> ./logs/update.log 2>&1

# Check if crawling was successful
if [ \$? -eq 0 ]; then
    echo "\$(date): Crawling completed successfully" >> ./logs/update.log
    
    # Count files
    FILE_COUNT=\$(ls -1 ./crawled-content/*.txt 2>/dev/null | wc -l)
    echo "\$(date): Found \$FILE_COUNT files to process" >> ./logs/update.log
    
    if [ \$FILE_COUNT -gt 0 ]; then
        echo "\$(date): Files ready for upload to Open WebUI" >> ./logs/update.log
        echo "\$(date): Visit http://localhost:3000/documents to upload new files" >> ./logs/update.log
    else
        echo "\$(date): Warning: No files were crawled" >> ./logs/update.log
    fi
else
    echo "\$(date): Error: Crawling failed" >> ./logs/update.log
fi

echo "\$(date): Update process completed" >> ./logs/update.log
echo "" >> ./logs/update.log
EOF

chmod +x update-knowledge-base.sh

echo "✅ Created update-knowledge-base.sh"
echo ""

# Create logs directory
mkdir -p logs

# Offer cron job options
echo "⏰ Cron Job Setup Options:"
echo "=========================="
echo ""
echo "1. Weekly update (Sundays at 2 AM)"
echo "2. Daily update (2 AM every day)"
echo "3. Custom schedule"
echo "4. Manual setup only (no cron job)"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        CRON_SCHEDULE="0 2 * * 0"
        CRON_DESCRIPTION="Weekly (Sundays at 2 AM)"
        ;;
    2)
        CRON_SCHEDULE="0 2 * * *"
        CRON_DESCRIPTION="Daily (2 AM every day)"
        ;;
    3)
        echo ""
        echo "📋 Cron schedule format: minute hour day month weekday"
        echo "Examples:"
        echo "  0 2 * * 0     = Sundays at 2 AM"
        echo "  30 1 * * 1-5  = Weekdays at 1:30 AM"
        echo "  0 */6 * * *   = Every 6 hours"
        echo ""
        read -p "Enter your cron schedule: " CRON_SCHEDULE
        CRON_DESCRIPTION="Custom: $CRON_SCHEDULE"
        ;;
    4)
        echo ""
        echo "✅ Setup complete without cron job."
        echo ""
        echo "📋 Manual Usage:"
        echo "• Run update anytime: ./update-knowledge-base.sh"
        echo "• View logs: tail -f ./logs/update.log"
        echo "• Upload files: Visit http://localhost:3000/documents"
        echo ""
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

# Add cron job
echo ""
echo "📝 Adding cron job..."

# Create temporary cron file
TEMP_CRON=$(mktemp)

# Get existing crontab (if any)
crontab -l 2>/dev/null > "$TEMP_CRON" || true

# Check if our job already exists
if grep -q "update-knowledge-base.sh" "$TEMP_CRON"; then
    echo "⚠️  Cron job already exists. Updating..."
    # Remove existing job
    grep -v "update-knowledge-base.sh" "$TEMP_CRON" > "${TEMP_CRON}.new"
    mv "${TEMP_CRON}.new" "$TEMP_CRON"
fi

# Add our job
echo "$CRON_SCHEDULE $PROJECT_DIR/update-knowledge-base.sh" >> "$TEMP_CRON"

# Install the new crontab
crontab "$TEMP_CRON"

# Clean up
rm "$TEMP_CRON"

echo "✅ Cron job added successfully!"
echo ""
echo "📋 Cron Job Details:"
echo "==================="
echo "Schedule: $CRON_DESCRIPTION"
echo "Command: $PROJECT_DIR/update-knowledge-base.sh"
echo "Logs: $PROJECT_DIR/logs/update.log"
echo ""
echo "🔧 Management Commands:"
echo "======================"
echo "• View all cron jobs: crontab -l"
echo "• Edit cron jobs: crontab -e"
echo "• Remove our job: crontab -l | grep -v update-knowledge-base.sh | crontab -"
echo "• View update logs: tail -f $PROJECT_DIR/logs/update.log"
echo "• Test update manually: $PROJECT_DIR/update-knowledge-base.sh"
echo ""
echo "⚠️  Important Notes:"
echo "==================="
echo "• The system must be running for cron jobs to execute"
echo "• Docker services must be running for the knowledge base to work"
echo "• Files are crawled automatically but must be uploaded manually to Open WebUI"
echo "• Check logs regularly to ensure updates are working"
echo ""
echo "✅ Automated update setup complete!"