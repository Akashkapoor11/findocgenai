#!/bin/bash
echo "🚀 Starting FinDocGenAI..."
echo ""

# Start backend
echo "▶ Starting backend on port 8000..."
cd backend
source venv/bin/activate 2>/dev/null || true
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo "▶ Starting frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers."

wait $BACKEND_PID $FRONTEND_PID
