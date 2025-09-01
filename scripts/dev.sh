#!/bin/bash
set -e

echo "Starting development environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "Shutting down development environment..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend on port 3000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend on port 3001..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Development environment started!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait
