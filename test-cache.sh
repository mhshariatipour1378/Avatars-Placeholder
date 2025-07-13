#!/bin/bash

echo "🧪 Testing Cache Functionality"
echo "=============================="

# Test 1: Check if X-Cache-Status header is present
echo "Test 1: Checking for X-Cache-Status header..."
response=$(curl -s -I http://localhost:3000/public/43)
if echo "$response" | grep -q "X-Cache-Status"; then
    echo "✅ X-Cache-Status header found"
    echo "$response" | grep "X-Cache-Status"
else
    echo "❌ X-Cache-Status header NOT found"
fi

echo ""

# Test 2: Check Cache-Control header
echo "Test 2: Checking Cache-Control header..."
if echo "$response" | grep -q "Cache-Control: public, max-age=0"; then
    echo "❌ Cache is disabled (max-age=0)"
elif echo "$response" | grep -q "Cache-Control: public, max-age="; then
    echo "✅ Cache is enabled"
    echo "$response" | grep "Cache-Control"
else
    echo "⚠️  Cache-Control header not found or unexpected format"
fi

echo ""

# Test 3: Check ETag header
echo "Test 3: Checking ETag header..."
if echo "$response" | grep -q "ETag:"; then
    echo "✅ ETag header found"
    echo "$response" | grep "ETag"
else
    echo "❌ ETag header NOT found"
fi

echo ""

# Test 4: Test 304 Not Modified functionality
echo "Test 4: Testing 304 Not Modified functionality..."
etag=$(echo "$response" | grep "ETag:" | cut -d'"' -f2)
if [ -n "$etag" ]; then
    echo "ETag: $etag"
    echo "Testing conditional request..."
    conditional_response=$(curl -s -I -H "If-None-Match: \"$etag\"" http://localhost:3000/public/43)
    if echo "$conditional_response" | grep -q "HTTP/1.1 304 Not Modified"; then
        echo "✅ 304 Not Modified response received"
    else
        echo "❌ Expected 304 Not Modified, got:"
        echo "$conditional_response" | head -1
    fi
else
    echo "❌ Could not extract ETag for testing"
fi

echo ""

# Test 5: Test cache control parameters
echo "Test 5: Testing cache control parameters..."
echo "Testing no_cache parameter..."
no_cache_response=$(curl -s -I "http://localhost:3000/public/43?no_cache=true")
if echo "$no_cache_response" | grep -q "Cache-Control: no-cache, no-store, must-revalidate"; then
    echo "✅ no_cache parameter working"
else
    echo "❌ no_cache parameter not working"
fi

echo "Testing cdn parameter..."
cdn_response=$(curl -s -I "http://localhost:3000/public/43?cdn=true")
if echo "$cdn_response" | grep -q "X-Cache-Control: cdn-enabled"; then
    echo "✅ cdn parameter working"
else
    echo "❌ cdn parameter not working"
fi

echo ""

# Test 6: Test multiple requests to see if cache status changes
echo "Test 6: Testing multiple requests..."
echo "First request:"
curl -s -I http://localhost:3000/public/43 | grep -E "(X-Cache-Status|Cache-Control|ETag)"

echo ""
echo "Second request (should show cache hit if working):"
curl -s -I http://localhost:3000/public/43 | grep -E "(X-Cache-Status|Cache-Control|ETag)"

echo ""
echo "Test completed!" 