async function testAPI() {
  const postId = '708b24f3-4335-478b-8a31-cbd0e67ddf08';
  const url = `http://localhost:3000/api/blog/posts/${postId}`;

  console.log('Testing API route:', url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('\nStatus:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
