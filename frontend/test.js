async function test() {
  try {
    // 1. Register a user
    const creds = { username: 'testuser123', identifier: 'testuser123', email: 'test@example.com', password: 'password123' };
    await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });

    // 2. Login
    let loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    
    if (!loginRes.ok) {
        console.error('Login failed', await loginRes.text());
        return;
    }
    
    let token = await loginRes.text(); // Assuming it returns a raw string or JSON
    try {
        let jsonToken = JSON.parse(token);
        if (jsonToken.token) token = jsonToken.token;
    } catch (e) {}

    // 3. Create a post
    let postRes = await fetch('http://localhost:8080/api/posts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Post',
        snippet: 'Test content',
        category: 'Technology'
      })
    });
    
    if (!postRes.ok) {
        console.error('Create post failed', await postRes.text());
        return;
    }

    let post = await postRes.json();
    console.log('Created Post:', post.id);

    // 4. Add a comment
    let commentRes = await fetch(`http://localhost:8080/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: 'Test comment'
      })
    });
    
    if (!commentRes.ok) {
        console.error('Add comment failed', await commentRes.text());
        return;
    }

    let updatedPost = await commentRes.json();
    console.log('Post after comment:', JSON.stringify(updatedPost, null, 2));
  } catch(e) {
    console.error(e);
  }
}

test();
