import React, { useEffect, useState } from 'react';

const ListsFeed = () => {
  const [lists, setLists] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listsResponse = await fetch('http://127.0.0.1:8000/api/lists_db_setup/');
        const listsData = await listsResponse.json();
        setLists(listsData.results);

        const usersResponse = await fetch('http://127.0.0.1:8000/api/users_db_setup/');
        const usersData = await usersResponse.json();
        setUsers(usersData.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Lists Feed</h1>

      <div id="lists-container">
        {lists.map((list) => (
          <div key={list.id}>
            <h3>{list.name}</h3>
            <p>{list.description}</p>
            <p>{list.content}</p>
            <p>{list.created}</p>
          </div>
        ))}
      </div>

      <h2>Users on the platform</h2>
      <div id="users-container">
        {users.map((user) => (
          <p key={user.id}>{user.name}</p>
        ))}
      </div>
    </div>
  );
};

export default ListsFeed;
