import React,
{
  useEffect,
  useState
}
from "react";

import axios from "axios";

function UserManagement() {

  const [users,
    setUsers] =
    useState([]);

  const [form,
    setForm] =
    useState({

      username: "",
      password: "",
      role: "USER"

    });

  useEffect(() => {

    loadUsers();

  }, []);

  const loadUsers =
    async () => {

      const response =
        await axios.get(
          "http://localhost:8081/api/users"
        );

      setUsers(
        response.data
      );
    };

  const addUser =
    async () => {

      await axios.post(
        "http://localhost:8081/api/users",
        form
      );

      loadUsers();
    };

  const deleteUser =
    async (id) => {

      await axios.delete(
        `http://localhost:8081/api/users/${id}`
      );

      loadUsers();
    };

  return (

    <div>

      <h1>User Management</h1>

      <input
        placeholder="Username"
        onChange={(e) =>
          setForm({
            ...form,
            username:
              e.target.value
          })
        }
      />

      <input
        placeholder="Password"
        onChange={(e) =>
          setForm({
            ...form,
            password:
              e.target.value
          })
        }
      />

      <select
        onChange={(e) =>
          setForm({
            ...form,
            role:
              e.target.value
          })
        }
      >

        <option>
          USER
        </option>

        <option>
          ADMIN
        </option>

      </select>

      <button
        onClick={addUser}
      >
        Add User
      </button>

      <table>

        <thead>

          <tr>

            <th>ID</th>

            <th>Username</th>

            <th>Role</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {users.map(user => (

            <tr key={user.id}>

              <td>{user.id}</td>

              <td>{user.username}</td>

              <td>{user.role}</td>

              <td>

                <button
                  onClick={() =>
                    deleteUser(
                      user.id
                    )
                  }
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default UserManagement;