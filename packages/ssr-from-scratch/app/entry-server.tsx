import React, { lazy, Suspense } from 'react';

// @ts-ignore
const ProductsComponent = lazy(() => import('./ProductsComponent'));


const Home = () => {
  return (
    <div>
      <h1>Products</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsComponent />
      </Suspense>
    </div>
  )
}

export default Home
