import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Button, Card, Spinner, Form, Toast, ToastContainer } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './footer';
import NavaPro from './navbarproduct';

// Helper function to render star ratings
const renderStars = (rating, color = "#ffc107") => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <span style={{ color }}>
      {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="bi bi-star-fill"></i>)}
      {halfStar && <i key="half" className="bi bi-star-half"></i>}
      {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="bi bi-star"></i>)}
    </span>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userid");
  const name = localStorage.getItem("user_name");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [backendReviews, setBackendReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  const handleViewStore = () => {
    navigate("/viewstore", { state: { vendorId: product.Vendor?._id } });
  };
  useEffect(() => {
  if (product?._id) {
    const viewedKey = `viewed_${product._id}`;
    const hasViewed = localStorage.getItem(viewedKey);

    if (!hasViewed) {
      axios
        .post(`https://backend-d6mx.vercel.app/updateview/${product._id}`)
        .then(() => {
          localStorage.setItem(viewedKey, "true"); // ✅ Mark as viewed
          console.log("Unique view recorded for product:", product._id);
        })
        .catch((err) => console.error("Error increasing view count:", err));
    }
  }
}, [product?._id]);


// ⭐ Fetch Recently Viewed Products


  // ✅ Wrapped in useCallback to safely use inside useEffect
  const fetchReviews = useCallback(() => {
    if (product?._id) {
      axios
        .get(`https://backend-d6mx.vercel.app/fetch/review/${product._id}`)
        .then((res) => setBackendReviews(res.data.getreview || []))
        .catch((err) => console.error("Error fetching reviews:", err));
    }
  }, [product?._id]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://backend-d6mx.vercel.app/product/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch product:', err);
        setLoading(false);
      });
  }, [id]);

  // ✅ fetchReviews safely included as dependency
  useEffect(() => {
    if (product?._id) {
      fetchReviews();
      if (product.ProductCategory) {
        axios
          .get(`https://backend-d6mx.vercel.app/related-products/${product.ProductCategory}?exclude=${product._id}`)
          .then((res) => setRelatedProducts(res.data))
          .catch((err) => console.error("Failed to fetch related products:", err));
      }
    }
  }, [product, fetchReviews]);

  const handleQuantity = (delta) => setQuantity(q => Math.max(1, q + delta));
  const pricechange = Number(product?.ProductPrice || 0) + 70;

 // ⭐ Add to Recently Viewed
useEffect(() => {
  if (product?._id) {
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const updated = [product._id, ...viewed.filter(id => id !== product._id)];
    localStorage.setItem("recentlyViewed", JSON.stringify(updated.slice(0, 10)));
  }
}, [product?._id]);



  const handleAddToCart = () => {
    if (!userId || userId === "undefined") {
      showToast("Please log in to add items to your cart.", "danger");
      return;
    }
    const cartData = {
      customerid: userId,
      Vendorid: product.Vendor?._id,
      productid: product._id,
      producturl: Array.isArray(product.ProductUrl) ? product.ProductUrl[0] : product.ProductUrl,
      productname: product.ProductName,
      productQuantity: quantity,
      productprice: pricechange,
      productvendor: product.Vendor?.Business_Name || "Unknown Vendor"
    };
    axios.post("https://backend-d6mx.vercel.app/api/cart", cartData)
      .then(() => showToast("Product added to cart!", "success"))
      .catch(() => showToast("Something went wrong.", "danger"));
  };

  const handleSubmitReview = () => {
    if (!userId || userId === "undefined") {
      showToast("Please log in to submit a review.", "danger");
      return;
    }
    if (!reviewText.trim() || reviewRating === 0) {
      showToast("Please provide a rating and comment.", "danger");
      return;
    }
    axios.post(`https://backend-d6mx.vercel.app/review/${userId}`, {
      productId: product._id,
      customerName: name,
      rating: reviewRating,
      comment: reviewText
    })
      .then(() => {
        showToast("Review submitted successfully!", "success");
        setReviewText('');
        setReviewRating(0);
        setShowReviewForm(false);
        fetchReviews();
      })
      .catch(() => showToast("Failed to submit review.", "danger"));
  };

  const keyFeatures = [
    "High compressive strength for durable construction",
    "Excellent workability and pumpability",
    "Superior finish and aesthetics",
    "Consistent quality and performance",
    "Eco-friendly manufacturing process",
    "Suitable for all weather conditions",
    "Faster setting time for quick construction",
    "Reduced shrinkage and cracking"
  ];

  const styles = `
    .product-detail-page { background-color: #ffffff; color: #1A202C; }
    .breadcrumb-nav a, .breadcrumb-nav span { color: #A0AEC0; text-decoration: none; font-size: 0.9rem; }
    .breadcrumb-nav a:hover { color: #050505ff; }
    .main-image { width: 100%; height: 450px; object-fit: cover; border-radius: 8px; border: 1px solid #2D3748; }
    .thumbnail-container { display: flex; gap: 10px; margin-top: 10px; }
    .thumbnail-img { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
    .thumbnail-img:hover { border-color: #4A5568; }
    .thumbnail-img.active { border-color: #FFD700; }
    .product-category-text { font-size: 0.9rem; color: #A0AEC0; margin-bottom: 4px; }
    .product-title { font-size: 1.8rem; font-weight: bold; color: #0f0f0fff; }
    .price { font-size: 2rem; font-weight: bold; color: #000000ff; }
    .old-price { text-decoration: line-through; color: #718096; margin-left: 10px; }
    .discount-badge { color: #48BB78; font-weight: bold; margin-left: 10px; }
    .seller-card { background-color: #2D3748; padding: 1rem; border-radius: 8px; border: 1px solid #4A5568; }
    .btn-add-to-cart { background-color: #FFD700; border: none; font-weight: bold; color: #000; }
    .btn-buy-now { background-color: #FFD700; border-color: #FFD700; font-weight: bold; color: #000; }
    .tab-nav { border-bottom: 1px solid #2D3748; padding-bottom: 0.5rem; }
    .tab-button.active { color: #FFD700; border-bottom-color: #FFD700; }
    .tab-button { background: none; border: none; color: #A0AEC0; padding: 0.5rem 1rem; font-weight: 600; border-bottom: 3px solid transparent; }
    .review-card { background-color: #2D3748; border-radius: 8px; border: 1px solid #4A5568; }
    .related-product-card { background-color: #2D3748; border: 1px solid #4A5568; color: #fff; }
    .review-form { background-color: #2D3748; border-radius: 8px; border: 1px solid #4A5568; margin-top: 1rem; }
    .review-form textarea { background-color: #1A202C; color: #fff; border-color: #4A5568; }
    .review-form textarea:focus { background-color: #1A202C; color: #fff; border-color: #DD6B20; box-shadow: none; }
  `;

  if (loading) return <div className="product-detail-page text-center py-5"><Spinner animation="border" variant="light" /></div>;
  if (!product) return <div className="product-detail-page text-center py-5"><p>Product not found.</p></div>;

  const productImages = Array.isArray(product.ProductUrl) ? product.ProductUrl : [product.ProductUrl];

  return (
    <>
      <NavaPro />
      <style>{styles}</style>
      <div className="product-detail-page">
        <Container className="py-5">
          <nav className="breadcrumb-nav mb-4">
            <Link to="/">Home</Link> &gt; <Link to="/products">{product.ProductCategory}</Link> &gt; <span>{product.ProductName}</span>
          </nav>
          <Row>
            <Col md={6} className="mb-4">
              <img src={productImages[activeIndex]} alt="Product" className="main-image" />
              <div className="thumbnail-container">
                {productImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`thumbnail ${index + 1}`}
                    className={`thumbnail-img ${activeIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="product-category-text">{product.ProductCategory}</p>
                  <h1 className="product-title">{product.ProductName}</h1>
                </div>
                <Button variant="link" className="p-0 fs-4 text-secondary"><i className="bi bi-heart"></i></Button>
              </div>
              <div className="d-flex align-items-center mb-3">
                <span className="me-2">{renderStars(4.6)}</span>
                {/* ✅ Fixed invalid <a href> */}
                <Button
                  variant="link"
                  className="text-secondary p-0"
                  onClick={() => {
                    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  ({backendReviews.length} reviews)
                </Button>
              </div>
              <div className="d-flex align-items-baseline mb-4">
                <span className="price">₹{pricechange}</span>
                <span className="old-price">₹{(pricechange * 1.08).toFixed(0)}</span>
                <span className="discount-badge">8% OFF</span>
              </div>
                            <div className="seller-card d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <div className="bg-warning rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-shop fs-5"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">{product.Vendor?.Business_Name || "BuildMart Pro"}</h6>
                    <span className="text-secondary small">{renderStars(4.8)} 4.8</span>
                  </div>
                </div>
                <Button variant="outline-secondary" size="sm" onClick={handleViewStore}>View Store</Button>
              </div>

              <div className="d-flex align-items-center mb-3">
                <span className="me-3">Quantity:</span>
                <Button
                  variant="outline-secondary"
                  onClick={() => handleQuantity(-1)}
                  className="rounded-circle p-0"
                  style={{ width: '30px', height: '30px' }}
                >
                  -
                </Button>
                <span className="mx-3 fs-5">{quantity}</span>
                <Button
                  variant="outline-secondary"
                  onClick={() => handleQuantity(1)}
                  className="rounded-circle p-0"
                  style={{ width: '30px', height: '30px' }}
                >
                  +
                </Button>
              </div>

              <Row className="g-2 mb-4">
                <Col><Button className="w-100 btn-add-to-cart" size="lg" onClick={handleAddToCart}>Add to Cart</Button></Col>
                <Col><Button className="w-100 btn-buy-now" size="lg">Buy Now</Button></Col>
              </Row>
            </Col>
          </Row>

          {/* Tabs Section */}
          <div className="mt-5">
            <nav className="tab-nav mb-4">
              <button className={`tab-button ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                <i className="bi bi-card-text me-2"></i>Product Details
              </button>
              <button className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                <i className="bi bi-star me-2"></i>Reviews
              </button>
              <button className={`tab-button ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}>
                <i className="bi bi-truck me-2"></i>Delivery & Returns
              </button>
            </nav>

            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ul className="list-unstyled">
                    {keyFeatures.map((feature, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill me-2 text-success"></i>{feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div id="reviews">
                    {backendReviews.length === 0 && <p>No reviews yet. Be the first to review!</p>}
                    {backendReviews.map((review, idx) => (
                      <Card key={idx} className="review-card mb-3 p-3">
                        <h6 className="mb-1">{review.customerName}</h6>
                        <div className="mb-2">{renderStars(review.rating)}</div>
                        <p className="mb-0">{review.comment}</p>
                      </Card>
                    ))}
                    {showReviewForm ? (
                      <div className="review-form p-3">
                        <Form.Group className="mb-2">
                          <Form.Label>Rating</Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            max={5}
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>Comment</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                          />
                        </Form.Group>
                        <Button className="btn-add-to-cart" onClick={handleSubmitReview}>Submit Review</Button>
                      </div>
                    ) : (
                      <Button className="btn-add-to-cart" onClick={() => setShowReviewForm(true)}>Write a Review</Button>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'delivery' && (
                <motion.div key="delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ul className="list-unstyled">
                    <li className="mb-2"><i className="bi bi-truck me-2 text-primary"></i>Free Delivery within 2-3 business days.</li>
                    <li className="mb-2"><i className="bi bi-box-seam me-2 text-primary"></i>Secure packaging to ensure product safety.</li>
                    <li className="mb-2"><i className="bi bi-arrow-return-left me-2 text-primary"></i>7-day return policy for eligible products.</li>
                    <li className="mb-2"><i className="bi bi-shield-check me-2 text-primary"></i>Quality guarantee for all items.</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Related Products */}
          <div className="mt-5">
            <h4 className="mb-3">Related Products</h4>
            <Row>
              {relatedProducts.slice(0, 4).map(prod => (
                <Col md={3} key={prod._id} className="mb-3">
                  <Card className="related-product-card h-100">
                    <Card.Img
                      variant="top"
                      src={prod.ProductUrl?.[0] || '/placeholder.png'}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body>
                      <Card.Title>{prod.ProductName}</Card.Title>
                      <div className="d-flex align-items-center mb-2">
                        {renderStars(4.5)}
                        <span className="text-secondary ms-2 small">
                          ({Math.floor(Math.random() * 2000) + 500})
                        </span>
                      </div>
                      <Card.Text className="fw-bold">₹{prod.ProductPrice}</Card.Text>
                      <Button
                        className="w-100 btn-add-to-cart"
                        size="sm"
                        onClick={() => navigate(`/product/${prod._id}`)}
                      >
                        View
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </div>

      <ToastContainer className="p-3" position="top-end">
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          bg={toast.variant}
          delay={3000}
          autohide
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Footer />
    </>
  );
};

export default ProductPage;

