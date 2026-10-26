// src/app/components/AppWrapper.tsx
import { memo } from 'react';  // ✅ Remove unused React import
import { ScrollToTop } from './ScrollToTop';
import RootLayout from '../pages/RootLayout';

const AppWrapper = memo(() => {
  return (
    <>
      <ScrollToTop />
      <RootLayout />
    </>
  );
});

AppWrapper.displayName = 'AppWrapper';

export default AppWrapper;