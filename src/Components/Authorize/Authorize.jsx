import { Redirect } from 'react-router-dom';
import cookie from 'cookie';

export default function Authorize({ children }) {
  const objCookie = cookie.parse(document.cookie);

  if (!(objCookie && objCookie.TamiArtToken)) {
    return <Redirect to='/' />;
  }

  return <>{children}</>;
};
