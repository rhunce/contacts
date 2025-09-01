#!/bin/bash

echo "Killing processes on ports 3000 and 3001..."

# Kill processes on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Killing processes on port 3000..."
    lsof -ti:3000 | xargs kill -9
    echo "Port 3000 cleared"
else
    echo "Port 3000 is free"
fi

# Kill processes on port 3001
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Killing processes on port 3001..."
    lsof -ti:3001 | xargs kill -9
    echo "Port 3001 cleared"
else
    echo "Port 3001 is free"
fi

echo "Done!"
