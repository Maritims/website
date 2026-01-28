#!/bin/bash

# 1. Request and validate the filename
while true; do
    read -r -p "Enter desired filename (must end in .html): " filename
    if [[ "$filename" =~ ^[a-zA-Z0-9._-]+\.html$ ]]; then
        break
    else
        echo "Invalid filename. Please use alphanumeric characters and ensure it ends in .html."
    fi
done

# 2. Request Page Title
read -r -p "Enter the page title: " title

# 3. Request Page Description
read -r -p "Enter the page description: " description

# 4. Create the file with predefined content
cat <<EOF > "website/$filename"
<!DOCTYPE html>
<html lang="en" class="ms-dos">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="$description">
    <title>$title</title>
    <link rel="stylesheet" href="./css/stylesheet.css">
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</head>
<body>
    <clueless-layout></clueless-layout>
</body>
</html>
EOF

git add "$filename"
echo "Successfully created $filename and added it to the repository!"