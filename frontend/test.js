async function test() {
  try {
    // 1. Register user 1
    const creds1 = { username: 'testuser1', identifier: 'testuser1', email: 'test1@example.com', password: 'password123' };
    await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds1)
    });
    const loginRes1 = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds1)
    });
    const loginData1 = await loginRes1.json();
    const token1 = loginData1.token;

    // 2. Register user 2
    const creds2 = { username: 'testuser2', identifier: 'testuser2', email: 'test2@example.com', password: 'password123' };
    await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds2)
    });
    const loginRes2 = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds2)
    });
    const loginData2 = await loginRes2.json();
    const token2 = loginData2.token;

    // 3. Create post with user 1
    const postPayload = {
      title: 'Test Post',
      snippet: 'Test content',
      category: 'Technology',
      author: creds1.username
    };
    const createRes = await fetch('http://localhost:8080/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
      body: JSON.stringify(postPayload)
    });
    const createdPost = await createRes.json();
    
    // 4. Comment with user 2 (triggers notification)
    const commentPayload = {
      text: 'Test comment from user 2',
      author: creds2.username
    };
    const commentRes = await fetch(`http://localhost:8080/api/posts/${createdPost.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
      body: JSON.stringify(commentPayload)
    });
    
    if (!commentRes.ok) {
        const err = await commentRes.text();
        console.error("Comment failed:", err);
    } else {
        const finalPost = await commentRes.json();
        console.log("Comment succeeded! Post comments:", finalPost.comments.length);
    }

  } catch(e) {
    console.error(e);
  }
}

test();
