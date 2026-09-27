import '../src/styles.css';

export const metadata = {
  title: 'CareerFlow | Your next move, organized',
  description: 'A focused workspace for finding and managing your next role.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}