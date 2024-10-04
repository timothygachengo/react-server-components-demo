
type ElementProps = {
    tag: any,
    props: any,
    children: any[]
}

const React = {
    createElement: (tag: any, props: any, ...children: any[]) => {
        if (typeof tag === 'function') {
            return tag(props, ...children)
        }

        const el = {
            tag,
            props,
            children
        }
        console.log(el)
        return el;
    }
}

const render = (el: ElementProps | string, container: HTMLElement) => {
    let domEl: any = null;
    if (typeof el === "string" || typeof el === "number") {
        domEl = document.createTextNode(el);
        container.appendChild(domEl);
        return;
    }

    if (Array.isArray(el)) {
        el.forEach(child => {
            console.log("child", child)
            if (child !== null && child !== undefined) {
                render(child, container);
            }
        });
        return;
    }

    console.log('Element:', el);

    if (!el || typeof el !== 'object' || !el.tag) {
        console.error('Invalid element:', el);
        return;
    }

    domEl = document.createElement(el.tag);

    let elProps = el.props ? Object.keys(el.props) : null;
    if (elProps && elProps.length > 0) {
      elProps.forEach((prop) => {
        if (prop === 'style') {
          Object.assign(domEl.style, el.props[prop]);
        } else {
          domEl[prop] = el.props[prop];
        }
      });
    }

    if (el.children && el.children.length > 0) {
        el.children.forEach((node) => render(node, domEl))
    }
    container.appendChild(domEl);
}

React.createElement("div", null,
    React.createElement("h1", null, "Hello World"),
    React.createElement("p", null, "This is a paragraph")
);

// const Button = () => {
//     // const [count, setCount] = React.useState(0);
//     //   const handleButtonClick = () => {
//     //      setCount((prev) => prev + 1);
//     //   }
//     return (
//         <button onClick={() => alert('Yay. This is a client component')}>Hi there</button>
//     )
// }

interface Product {
    id:                   number;
    title:                string;
    description:          string;
    category:             string;
    price:                number;
    discountPercentage:   number;
    rating:               number;
    stock:                number;
    tags:                 string[];
    brand:                string;
    sku:                  string;
    weight:               number;
    dimensions:           Dimensions;
    warrantyInformation:  string;
    shippingInformation:  string;
    availabilityStatus:   string;
    reviews:              Review[];
    returnPolicy:         string;
    minimumOrderQuantity: number;
    meta:                 Meta;
    images:               string[];
    thumbnail:            string;
}

interface Dimensions {
    width:  number;
    height: number;
    depth:  number;
}

interface Meta {
    createdAt: Date;
    updatedAt: Date;
    barcode:   string;
    qrCode:    string;
}

interface Review {
    rating:        number;
    comment:       string;
    date:          Date;
    reviewerName:  string;
    reviewerEmail: string;
}


interface ProductResponse {
    products: Product[];
}



const App = ({ data }: { data : ProductResponse }) => {
    const products = data.products;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            margin: '20px',
        }}>
            {products && products.length > 0 ? (
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
                    </div>
                ))
            ) : (
                <div>No products found</div>
            )}
            {console.log('Products:', products)} {/* Add this line for debugging */}
        </div>
    )
}


export {}
const dataset = await fetch('https://dummyjson.com/products').then(res => res.json())
.then((data: ProductResponse) => {
    if (!data) {
        return;
    }
    return data;
   
});

render(<App data={dataset} />, document.getElementById('root'))
