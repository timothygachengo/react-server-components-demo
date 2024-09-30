import React, { lazy, Suspense } from 'react';

// @ts-ignore
const ProductsComponent = lazy(() => import('./ProductsComponent.tsx'));


export default function Home  () {
  return (
    <div>
      <h1>Products</h1>
      <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eos, tempore assumenda. Est magni laborum necessitatibus nihil perspiciatis corrupti ipsam illum ea nesciunt vitae placeat nemo, laboriosam odio earum magnam! Culpa!</p>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsComponent />
      </Suspense>
    </div>
  )
}


