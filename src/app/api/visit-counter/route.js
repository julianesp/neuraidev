import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Persistent storage file path
const dataFile = path.join(process.cwd(), 'data', 'visit-counter.json');

// Ensure the data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read the current count from the file
const readCount = () => {
  try {
    ensureDataDirectory();
    
    if (!fs.existsSync(dataFile)) {
      // Initialize with 0 if file doesn't exist
      fs.writeFileSync(dataFile, JSON.stringify({ count: 0 }), 'utf8');
      return 0;
    }

    const data = fs.readFileSync(dataFile, 'utf8');
    const json = JSON.parse(data);
    return json.count || 0;
  } catch (error) {
    console.error('Error reading visit count:', error);
    return 0;
  }
};

// Write the count to the file
const writeCount = (count) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(dataFile, JSON.stringify({ count }), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing visit count:', error);
    return false;
  }
};

// GET handler - Return the current count
export async function GET(request) {
  try {
    const count = readCount();
    return NextResponse.json({ count, success: true });
  } catch (error) {
    console.error('Error in GET /api/visit-counter:', error);
    return NextResponse.json(
      { error: 'Failed to get visit count', success: false },
      { status: 500 }
    );
  }
}

// POST handler - Increment the count
export async function POST(request) {
  try {
    const currentCount = readCount();
    const newCount = currentCount + 1;
    
    const success = writeCount(newCount);
    
    if (!success) {
      throw new Error('Failed to write updated count');
    }
    
    return NextResponse.json({ count: newCount, success: true });
  } catch (error) {
    console.error('Error in POST /api/visit-counter:', error);
    return NextResponse.json(
      { error: 'Failed to update visit count', success: false },
      { status: 500 }
    );
  }
}

