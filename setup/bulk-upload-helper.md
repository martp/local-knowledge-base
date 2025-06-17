# Bulk Upload Helper

Since Open WebUI doesn't have a direct API for bulk uploads yet, here are the most efficient ways to upload your crawled content:

## Method 1: Web Interface (Recommended)

1. **Start your knowledge base:**
   ```bash
   docker-compose up -d
   ```

2. **Visit the documents page:**
   - Go to http://localhost:3000/documents
   - Login with your account

3. **Bulk upload files:**
   - Click "Add Docs" button
   - **Select all files** from `./crawled-content/` folder
   - Drag and drop all files at once
   - Wait for processing to complete

4. **Monitor progress:**
   - Files will show processing status
   - Wait for all files to show "Processed" status
   - This may take several minutes depending on content size

## Method 2: Command Line (Future Enhancement)

*Note: This would require Open WebUI API access, which is not yet available in the current version*

## Method 3: Watch Folder Automation

You can create a simple script to automatically move files to Open WebUI's data directory:

```bash
#!/bin/bash
# auto-upload.sh - Experimental direct file approach

WEBUI_DATA="./webui-data/uploads"
CRAWLED_DIR="./crawled-content"

if [ -d "$WEBUI_DATA" ] && [ -d "$CRAWLED_DIR" ]; then
    echo "Moving files to Open WebUI data directory..."
    cp "$CRAWLED_DIR"/*.txt "$WEBUI_DATA"/ 2>/dev/null || true
    echo "Files moved. Check Open WebUI for processing status."
else
    echo "Directories not found. Use Method 1 instead."
fi
```

## Tips for Efficient Uploading

### File Naming
- Files are already named descriptively by the crawler
- Format: `Source_Name_Page_Path_Timestamp.txt`
- Easy to identify and organize

### Batch Processing
- Upload in batches of 20-50 files at a time
- Prevents browser timeout issues
- Easier to monitor processing status

### Duplicate Handling
- Open WebUI automatically handles duplicate content
- Safe to re-upload files
- Newer versions will update existing documents

### Processing Time
- Expect 1-5 seconds per file for processing
- Larger files take longer
- Vector embedding generation is the slowest step

## Troubleshooting Upload Issues

### Files Not Processing
1. Check file format is supported (TXT, PDF, MD, DOCX)
2. Verify file size isn't too large (>10MB may fail)
3. Check Docker logs: `docker-compose logs open-webui`

### Upload Failures
1. Refresh the page and try again
2. Upload smaller batches
3. Check available disk space
4. Restart Open WebUI: `docker-compose restart open-webui`

### Processing Stuck
1. Check Qdrant status: `docker-compose logs qdrant`
2. Verify Ollama is running: `ollama list`
3. Restart all services: `docker-compose restart`

## Automation Ideas

### Notification Script
```bash
#!/bin/bash
# notify-upload.sh - Notify when files are ready for upload

CRAWLED_DIR="./crawled-content"
FILE_COUNT=$(ls -1 "$CRAWLED_DIR"/*.txt 2>/dev/null | wc -l)

if [ $FILE_COUNT -gt 0 ]; then
    echo "📁 $FILE_COUNT files ready for upload"
    echo "🌐 Visit: http://localhost:3000/documents"
    
    # Optional: Send system notification (macOS)
    # osascript -e "display notification \"$FILE_COUNT files ready for upload\" with title \"Knowledge Base Update\""
fi
```

### Upload Reminder
Add this to your cron job or run manually:
```bash
./setup/notify-upload.sh
```

---

**Next Steps:**
1. Run `npm run crawl` to generate content
2. Use Method 1 to upload files to Open WebUI
3. Start asking questions about your crawled content!