/*
  Description: This page contains login page
*/
import Image from 'next/image';
import styles from './login.module.css';
import Link from 'next/link';
import LoginForm from '../../components/loginForm/loginForm';

function LoginPage() {
  return (
    <main className={styles.main}>
      {/* logo image */}
      <div className={styles.login_logo}>
        <Image
          src={'/images/signup/signup_logo.svg'}
          alt={'logo image'}
          fill={true}
        />
      </div>

      {/* login form */}
      <LoginForm />

      {/* prompt user to register instead */}
      <div className={styles.user_signup_prompt}>
        <span>New here?</span>
        <Link href={'/signup'}>
          <button>
              Register
          </button>
        </Link>
      </div>
    </main>
  );
}

export default LoginPage;