const React = {
    createElement: (tag, props, ...children) => {
        if (typeof tag === 'function') {
            return tag(props, ...children);
        }
        const el = {
            tag,
            props,
            children
        };
        console.log(el);
        return el;
    }
};
const render = (el, container) => {
    let domEl = null;
    if (typeof el === "string" || typeof el === "number") {
        domEl = document.createTextNode(el);
        container.appendChild(domEl);
        return;
    }
    if (Array.isArray(el)) {
        el.forEach(child => {
            console.log("child", child);
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
            }
            else {
                domEl[prop] = el.props[prop];
            }
        });
    }
    if (el.children && el.children.length > 0) {
        el.children.forEach((node) => render(node, domEl));
    }
    container.appendChild(domEl);
};
React.createElement("div", null, React.createElement("h1", null, "Hello World"), React.createElement("p", null, "This is a paragraph"));
const App = ({ data }) => {
    const products = data.products;
    return (React.createElement("div", { style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            margin: '20px',
        } },
        products && products.length > 0 ? (products.map(product => (React.createElement("div", { key: product.id, style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '10px',
                border: '1px solid #eee',
                borderRadius: '5px',
                boxShadow: '0 0 5px 0 rgba(0,0,0,0.1)',
                backgroundColor: '#eee',
                width: '340px'
            } },
            React.createElement("img", { style: {
                    width: '340px',
                    height: '300px',
                }, loading: "lazy", src: product.thumbnail, alt: product.title }),
            React.createElement("h3", { style: {
                    textWrap: 'wrap'
                } }, product.title),
            React.createElement("p", null,
                "Price: $",
                product.price),
            React.createElement("p", null,
                "Rating: ",
                product.rating,
                "/5"))))) : (React.createElement("div", null, "No products found")),
        console.log('Products:', products),
        " "));
};
const dataset = await fetch('https://dummyjson.com/products').then(res => res.json())
    .then((data) => {
    if (!data) {
        return;
    }
    return data;
});
render(React.createElement(App, { data: dataset }), document.getElementById('root'));
export {};
