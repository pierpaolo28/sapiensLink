import React, { useEffect, useState } from 'react';

const DBSetup = () => {
  const [users, setUsers] = useState([]);
  const [lists, setLists] = useState([]);

  const fetchUserDataAndDisplay = async () => {
    try {
      // Fetch and display data from http://127.0.0.1:8000/api/users_db_setup/
      let userResponse = await fetch('http://127.0.0.1:8000/api/users_db_setup/');
      let usersData = await userResponse.json();

      console.log('Displaying users data on the page...');
      setUsers(usersData.results);
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
  };

  const fetchListDataAndDisplay = async () => {
    try {
      // Fetch and display data from http://127.0.0.1:8000/api/lists_db_setup/
      let listResponse = await fetch('http://127.0.0.1:8000/api/lists_db_setup/');
      let listsData = await listResponse.json();

      console.log('Displaying lists data on the page...');
      setLists(listsData.results);
    } catch (error) {
      console.error('Error fetching lists data:', error);
    }
  };

  useEffect(() => {
    // Fetch and display data when the component mounts
    fetchUserDataAndDisplay();
    fetchListDataAndDisplay();
  }, []); // Empty dependency array ensures useEffect runs once when the component mounts

  const postNewUserData = async () => {
    try {
      console.log('Posting users data...');
      let usersJsonResponse = await fetch('/users.json');
      let usersJson = await usersJsonResponse.json();

      // Post data to the server
      await fetch('http://127.0.0.1:8000/api/users_db_setup/', {
        method: 'POST',
        body: JSON.stringify(usersJson),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });

      console.log('Users data posted successfully.');

      // Fetch and display data after posting
      fetchUserDataAndDisplay();
    } catch (error) {
      console.error('Error posting users data:', error);
    }
  };

  const postNewListData = async () => {
    try {
      console.log('Posting lists data...');
      let listsJsonResponse = await fetch('/lists.json');
      let listsJson = await listsJsonResponse.json();

      // Post data to the server
      await fetch('http://127.0.0.1:8000/api/lists_db_setup/', {
        method: 'POST',
        body: JSON.stringify(listsJson),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });

      console.log('Lists data posted successfully.');

      // Fetch and display data after posting
      fetchListDataAndDisplay();
    } catch (error) {
      console.error('Error posting lists data:', error);
    }
  };

  return (
    <div>
      <h1>DB Setup</h1>

      {/* Render your component UI here */}
      <div>
        <h2>Users Data</h2>
        <button type="button" onClick={postNewUserData}>
          Add Users
        </button>
        <div>
          {users.map((user) => (
            <div key={user.id}>
              <h3>{user.id}</h3>
              <p>{user.name}</p>
              <p>{user.email}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2>Lists Data</h2>
        <button type="button" onClick={postNewListData}>
          Add Lists
        </button>
        <div>
          {lists.map((list) => (
            <div key={list.id}>
              <h3>{list.name}</h3>
              <p>{list.description}</p>
              <p>{list.content}</p>
              <p>{list.created}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DBSetup;
