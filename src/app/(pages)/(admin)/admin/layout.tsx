import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

// add the required fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const bebasNeue = Bebas_Neue({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
});

// title and description (meta tag) at home page
export const metadata: Metadata = {
  title: 'The Bangalore drum shop',
  description: 'Ultimate place to get all your musical instruments',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body>
        {children}
        <Toaster position='top-center'/>
      </body>
    </html>
  );
}
