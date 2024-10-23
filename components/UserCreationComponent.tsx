// components/UserCreationComponent.js
import React, { useState } from 'react';

const UserCreationComponent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createUser = async () => {
    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('User created:', data);
      alert('User created successfully');
      setName('');
      setEmail('');
      setPassword('');
    } else {
      console.error('Error creating user:', response.statusText);
      alert('Error creating user');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission
    createUser(); // Call the createUser function
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Create User</button>
    </form>
  );
};

export default UserCreationComponent;