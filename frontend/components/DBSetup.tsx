"use client";
import React, { useEffect, useState } from "react";

export const DBSetup = () => {
  const [users, setUsers] = useState([]);
  const [lists, setLists] = useState([]);
  const [ranks, setRanks] = useState([]);

  // Fetches user data
  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/users_db_setup/");
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Error fetching users data:", error);
      return [];
    }
  };

  // Fetches list data
  const fetchListData = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/lists_db_setup/");
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Error fetching lists data:", error);
      return [];
    }
  };

  // Fetches rank data
  const fetchRankData = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/rank_home/");
      const data = await response.json();
      return data.ranks;
    } catch (error) {
      console.error("Error fetching ranks data:", error);
      return [];
    }
  };

  // Initial data fetching
  useEffect(() => {
    fetchUserData().then(setUsers);
    fetchListData().then(setLists);
    fetchRankData().then(setRanks);
  }, []);

  // Posts new user data
  const postNewUserData = async () => {
    try {
      const usersJsonResponse = await fetch("/users.json");
      const usersJson = await usersJsonResponse.json();

      await fetch("http://localhost:8001/api/users_db_setup/", {
        method: "POST",
        body: JSON.stringify(usersJson),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      fetchUserData().then(setUsers);
    } catch (error) {
      console.error("Error posting users data:", error);
    }
  };

  // Posts new list data
  const postNewListData = async () => {
    try {
      const listsJsonResponse = await fetch("/lists.json");
      const listsJson = await listsJsonResponse.json();

      await fetch("http://localhost:8001/api/lists_db_setup/", {
        method: "POST",
        body: JSON.stringify(listsJson),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      fetchListData().then(setLists);
    } catch (error) {
      console.error("Error posting lists data:", error);
    }
  };

  // Posts new rank data
  const postNewRankData = async () => {
    try {
      const ranksJsonResponse = await fetch("/ranks.json");
      const ranksJson = await ranksJsonResponse.json();

      await fetch("http://localhost:8001/api/ranks_db_setup/", {
        method: "POST",
        body: JSON.stringify(ranksJson),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      fetchRankData().then(setRanks);
    } catch (error) {
      console.error("Error posting ranks data:", error);
    }
  };

  return (
    <div>
      <h1>DB Setup</h1>

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

      <div>
        <h2>Ranks Data</h2>
        <button type="button" onClick={postNewRankData}>
          Add Ranks
        </button>
        <div>
          {ranks.map((rank) => (
            <div key={rank.name}>
              <h3>{rank.name}</h3>
              <p>{rank.description}</p>
              <div>
                {Object.entries(rank.content).map(([key, value]) => (
                  <div key={key}>
                    <p>
                      {value.element} (User ID: {value.user_id})
                    </p>
                  </div>
                ))}
              </div>
              <p>{rank.created}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DBSetup;
