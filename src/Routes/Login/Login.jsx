import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [strPassword, setPassword] = useState('');
  const objHistory = useHistory();

  const fnLogin = () => {
    axios({
      url: '/api/login',
      method: 'POST',
      data: {
        Password: strPassword,
      },
    })
      .then(() => objHistory.push('/editwork'))
      .catch(console.dir);
  };

  return (
    <>
      <h1>Enter Password</h1>
      <input
        type='text'
        value={strPassword}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={fnLogin}>
        Submit
      </button>
    </>
  );
}
