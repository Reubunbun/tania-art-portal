import { type FC, type ReactNode } from 'react';
import { Redirect } from 'react-router-dom';
import { parse as parseCookie } from 'cookie';
import { COOKIE_NAME } from '../../../shared/Constants';

interface Props {
  children: ReactNode;
}

const Authorize: FC<Props> = ({ children }) => {
  const cookie = parseCookie(document.cookie);

  if (!cookie[COOKIE_NAME]) {
    return <Redirect to='/' />;
  }

  return <>{children}</>;
};

export default Authorize;
