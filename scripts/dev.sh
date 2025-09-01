#!/bin/bash
set -e

echo "Starting development environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "Shutting down development environment..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "Killing existing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Kill any existing processes on our ports
echo "Checking for existing processes..."
kill_port 3000
kill_port 3001

# Start backend
echo "Starting backend on port 3000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend failed to start. Trying port 3002..."
    kill_port 3002
    PORT=3002 npm run dev &
    BACKEND_PID=$!
    sleep 3
fi

# Start frontend
echo "Starting frontend on port 3001..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Get the actual backend port
BACKEND_PORT=$(lsof -ti:3000 >/dev/null 2>&1 && echo "3000" || echo "3002")

echo "Development environment started!"
echo "Backend: http://localhost:$BACKEND_PORT"
echo "Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait
