import React, { Suspense, lazy } from 'react';
// @ts-ignore
import { Product } from './types';

// @ts-ignore
import ClientWrapper from './ClientWrapper.tsx';
interface ProductResponse {
    products: Product[];
}

export default async function ProductsComponent() {
    const productsResponse: ProductResponse = await fetch('https://dummyjson.com/products').then(res => res.json());
    const products = productsResponse.products;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 32,
            margin: '0 20',
        }}>
            {products && products.length > 0 ?
                products.map(product => (
                    <div key={product.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '10px',
                        border: '1px solid #eee',
                        borderRadius: '5px',
                        boxShadow: '0 0 5px 0 rgba(0,0,0,0.1)',
                        backgroundColor: '#eee',
                        width: '340px'
                    }}>
                        <img style={{
                            width: '340px',
                            height: '300px',
                        }} loading="lazy" src={product.thumbnail} alt={product.title} />
                        <h3 style={{
                            textWrap: 'wrap'
                        }}>{product.title}</h3>
                        <p>Price: ${product.price}</p>
                        <p>Rating: {product.rating}/5</p>
                        <ClientWrapper/>
                       
                    </div>
                ))
                : <div>No products found</div>}
        </div>


    )
};
