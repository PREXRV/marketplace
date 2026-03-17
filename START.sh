#!/bin/bash

echo "=========================================="
echo "   ZAPUSK FRONTEND"
echo "=========================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "OSHIBKA: Node.js ne ustanovlen!"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Ustanovka zavisimostey..."
    npm install
fi

echo ""
echo "Zapusk frontend..."
echo "Otkroi: http://localhost:3000"
echo ""
npm run dev
