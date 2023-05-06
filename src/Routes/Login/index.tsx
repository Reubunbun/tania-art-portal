import { FC, useState } from 'react';
import * as ReactRouterDom from 'react-router-dom';

const Login: FC = () => {
  const [password, setPassword] = useState<string>('');
  const history = ReactRouterDom.useHistory();

  const login = async () => {
    const resp = await fetch(
      '/api/login',
      {
        method: 'POST',
        body: JSON.stringify({ Password: password }),
      },
    );

    if (resp.status === 200) {
      history.push('/editwork');
    }
  };

  return (
    <>
      <h1>Enter Password</h1>
      <input
        type='text'
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        type='button'
        onClick={login}
      >
        Submit
      </button>
    </>
  );
};

export default Login;
