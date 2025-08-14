// pages/sidevendor.jsx
import React from 'react';
import { Form } from 'react-bootstrap';

const allCategories = [
  'UltraTech',
  'Ambuja',
  'ACC',
  'JK',
  'Shree',
  'Birla',
];

function SidebarFilters({ selectedTag, setSelectedTag, selectedCategories, setSelectedCategories }) {
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter(c => c !== value));
    } else {
      setSelectedCategories([...selectedCategories, value]);
    }
  };

  return (
    <div 
      className="filter-panel" 
      style={{
        backgroundColor: '#fff',  // White background
        padding: '15px',
        borderRadius: '8px', // Rounded corners
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height:"100%", // Soft shadow
        marginTop:"20px"
      }}
    >
      <h5 className="text-dark mb-3">Filters</h5>

      <Form.Group className="mb-3">
        <Form.Label className="text-dark">Tag</Form.Label>
        <Form.Select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">All</option>
          <option value="Verified">Verified</option>
          <option value="In Stock">In Stock</option>
          <option value="Hot Deal">Hot Deal</option>
          <option value="Best Seller">Best Seller</option>
          <option value="Premium">Premium</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="text-dark">Cement Brand</Form.Label>
        {allCategories.map(category => (
          <Form.Check
            key={category}
            type="checkbox"
            label={category}
            value={category}
            checked={selectedCategories.includes(category)}
            onChange={handleCategoryChange}
            className="text-dark"
          />
        ))}
      </Form.Group>
    </div>
  );
}

export default SidebarFilters;
