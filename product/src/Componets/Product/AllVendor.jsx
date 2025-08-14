import React, { useState } from 'react';
import NavaPro from './navbarproduct';
import SidebarFilters from './sidevendor';
import ProductList from './ProductList';
import { Container, Row, Col } from 'react-bootstrap';

const dummyProducts = [
  {
    name: "UltraTech OPC Cement",
    category: "UltraTech",
    price: 420,
    location: "Indore, MP",
    image: "https://via.placeholder.com/300",
    tags: ["Verified", "In Stock"]
  },
  {
    name: "Ambuja Cement PPC",
    category: "Ambuja",
    price: 385,
    location: "Nagpur, MH",
    image: "https://via.placeholder.com/300",
    tags: ["Hot Deal"]
  },
  {
    name: "ACC Gold Water Shield Cement",
    category: "ACC",
    price: 450,
    location: "Raipur, CG",
    image: "https://via.placeholder.com/300",
    tags: ["Premium"]
  },
  {
    name: "JK Super Strong Cement",
    category: "JK",
    price: 410,
    location: "Ujjain, MP",
    image: "https://via.placeholder.com/300",
    tags: ["Verified", "In Stock"]
  }
];



function ProductCategoryPage() {
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const filteredProducts = dummyProducts.filter(prod => {
    const tagMatch = selectedTag ? prod.tags.includes(selectedTag) : true;
    const categoryMatch = selectedCategories.length > 0
      ? selectedCategories.includes(prod.category)
      : true;
    return tagMatch && categoryMatch;
  });

  return (
    <>
      <NavaPro />
      <Container fluid className="text-dark py-4">
        <Row>
          <Col md={3}>
            <SidebarFilters
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          </Col>
          <Col md={9}>
            <h4 className="mb-3">Cement & Concrete Products</h4>
            <ProductList products={filteredProducts} />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ProductCategoryPage;
