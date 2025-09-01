#!/bin/bash
set -e

# Development environment configuration:
# - Backend: Port 3000 (Express.js)
# - Frontend: Port 3001 (Next.js)
# - Frontend is configured to use port 3001 by default in package.json

echo "Starting development environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "Shutting down development environment..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    
    # Kill any processes using ports 3000 and 3001
    echo "Cleaning up ports..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Kill any existing processes on ports 3000 and 3001
echo "Checking for existing processes on ports 3000 and 3001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be freed
sleep 2

# Verify ports are free
echo "Verifying ports are free..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "ERROR: Port 3000 is still in use. Please run './scripts/kill-ports.sh' manually."
    exit 1
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "ERROR: Port 3001 is still in use. Please run './scripts/kill-ports.sh' manually."
    exit 1
fi

echo "Ports 3000 and 3001 are free!"

# Start backend
echo "Starting backend on port 3000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start and verify it's running
sleep 5
if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo "ERROR: Backend failed to start on port 3000"
    exit 1
fi
echo "Backend is running on port 3000"

# Start frontend
echo "Starting frontend on port 3001..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start and verify it's running
sleep 3
if ! lsof -ti:3001 > /dev/null 2>&1; then
    echo "ERROR: Frontend failed to start on port 3001"
    exit 1
fi
echo "Frontend is running on port 3001"

echo "Development environment started!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait
