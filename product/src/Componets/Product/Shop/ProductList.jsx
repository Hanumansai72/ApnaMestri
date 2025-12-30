// components/ProductList.jsx
import React from 'react';
import ProductCard from './Productcard';
import { Row, Col } from 'react-bootstrap';

function ProductList({ products }) {
  return (
    <Row xs={1} md={3} className="g-4">
      {products.map((product, idx) => (
        <Col key={idx}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
}

export default ProductList;
