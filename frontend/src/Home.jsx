import React, { useState, useEffect } from 'react';

const Home = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/home_page/');
        const jsonData = await response.json();
        console.log(jsonData)
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // The empty dependency array ensures that this effect runs once after the initial render

  return (
    <div>
      {data ? (
        <div>
          <h2>Pagination:</h2>
          <p>Current Page: {data.pagination.current_page}</p>
          <p>Next Page: {data.pagination.next_page}</p>
          <p>Previous Page: {data.pagination.previous_page}</p>
          <p>Total Pages: {data.pagination.total_pages}</p>

          <h2>Lists:</h2>
          <ul>
            {data.lists.map((item, index) => (
              <li key={index}>
                <p>ID: {item.id}</p>
                <p>Name: {item.name}</p>
                <p>Content: {item.content}</p>
              </li>
            ))}
          </ul>

          <h2>Users:</h2>
          <ul>
            {data.users.map((user, index) => (
              <li key={index}>
                <p>ID: {user.id}</p>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Home;
