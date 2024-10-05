import React, { lazy, Suspense } from 'react'
import Button from './Button'


const ProductsComponent = lazy(() => import('./ProductsComponent.client'));

const App = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading....</div>}>
        <ProductsComponent />
      </Suspense>
    </div>

  )
}

export default App