import React from "react";
import { motion } from "framer-motion";
import NavaPro from "../Layout/navbarproduct";
import Footer from "../Layout/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function Aboutus() {
  return (
    <>
      <NavaPro></NavaPro>
      <main className="bg-light">
        {/* Hero */}
        <section className="container py-5">
          <motion.div
            className="row align-items-center g-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div className="col-lg-7" variants={fadeUp}>
              <h1 className="display-5 fw-bold">
                Building Trust, <span className="text-warning">One</span> Project at a Time
              </h1>
              <p className="text-secondary mt-3">
                Connecting skilled craftsmen with homeowners across India. We make construction and repair services transparent, reliable, and quality-driven.
              </p>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-warning text-dark fw-semibold">Watch Our Story</button>
                <button className="btn btn-outline-secondary">Learn More</button>
              </div>
            </motion.div>
            <motion.div className="col-lg-5 text-center" variants={fadeUp}>
              <img
                src="https://res.cloudinary.com/dqxsgmf33/image/upload/v1755801310/Changed_logo_dfshkt.png"
                alt="Apna Mestri Hero"
                className="img-fluid rounded-3 shadow-sm"
                style={{ width: "300px", height: "300px", border: "1px soild white", borderRadius: "50%" }}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Challenge */}
        <section className="py-5 bg-white">
          <div className="container">
            <motion.h2
              className="h3 text-center mb-2"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              The Challenge We Solve
            </motion.h2>
            <motion.p
              className="text-center text-secondary mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Finding reliable, skilled craftsmen and quality materials is hard. We bridge this gap with technology and trust.
            </motion.p>

            <motion.div
              className="row g-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              <motion.div className="col-md-4" variants={fadeUp}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">Unreliable Workers</h5>
                    <p className="card-text text-secondary">
                      Homeowners struggle with no-shows, delays, and inconsistent quality. We verify skills, track jobs, and ensure dependable delivery.
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div className="col-md-4" variants={fadeUp}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">Price Transparency</h5>
                    <p className="card-text text-secondary">
                      Clear estimates and milestone-based payments keep projects on budget with no hidden costs.
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div className="col-md-4" variants={fadeUp}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">Finding Quality</h5>
                    <p className="card-text text-secondary">
                      With proper verification and training, we deliver quality workmanship, safe practices, and professional standards.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* What Apna Mestri does */}
            <motion.div
              className="row g-3 mt-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              <motion.div className="col-md-4" variants={fadeUp}>
                <div className="card border-0 h-100 bg-light">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-2">Hire Skilled Workers</h6>
                    <p className="mb-0 text-secondary">
                      Book plumbers, carpenters, electricians, masons—nearby—for repairs, renovations, and big projects.
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div className="col-md-4" variants={fadeUp}>
                <div className="card border-0 h-100 bg-light">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-2">Connect with Engineers</h6>
                    <p className="mb-0 text-secondary">
                      Consult experts for planning, BoQs, structural guidance, and on-site supervision.
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div className="col-md-4" variants={fadeUp}>
                <div className="card border-0 h-100 bg-light">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-2">Shop Quality Materials</h6>
                    <p className="mb-0 text-secondary">
                      Buy cement, steel, tiles, and paints from trusted, verified vendors with on-time delivery.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mission + Stats */}
        <section className="py-5">
          <div className="container">
            <motion.div
              className="card border-0 shadow-sm"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="card-body p-4 p-lg-5">
                <div className="text-center mb-4">
                  <span className="badge bg-warning text-dark fs-6">Our Mission</span>
                  <p className="mt-3 mb-0 text-secondary">
                    To revolutionize India’s construction and repair industry by creating a trusted ecosystem where skilled craftsmen and homeowners connect seamlessly—ensuring quality work, fair pricing, and complete transparency in every project.
                  </p>
                </div>

                <div className="row text-center g-3">
                  <div className="col-md-4">
                    <h3 className="fw-bold mb-0 text-dark">10,000+</h3>
                    <div className="text-secondary">Verified Craftsmen</div>
                  </div>
                  <div className="col-md-4">
                    <h3 className="fw-bold mb-0 text-dark">50,000+</h3>
                    <div className="text-secondary">Projects Completed</div>
                  </div>
                  <div className="col-md-4">
                    <h3 className="fw-bold mb-0 text-dark">25+</h3>
                    <div className="text-secondary">Cities Served</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Why choose */}
            <h3 className="h4 text-center mt-5 mb-3">Why Choose Apna Mestri?</h3>
            <motion.div
              className="row g-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {[
                { t: "Rigorous Verification", d: "Background checks, KYC, and documented skill tests before going live." },
                { t: "Fair Payment System", d: "Milestone-based payouts and escrow-like safeguards for both sides." },
                { t: "Technology-Driven", d: "Instant booking, live tracking, digital invoices, and project logs." },
                { t: "24/7 Customer Support", d: "Multi-channel help for booking, changes, and issue resolution." },
                { t: "Customer-Centric", d: "Dedicated assistance for quality, satisfaction, and quick redressal." },
                { t: "Data-Driven Insights", d: "Benchmarks on pricing, timelines, and performance analytics." },
                { t: "Continuous Training", d: "Upskilling programs for standards, safety, and workmanship." },
                { t: "Quality Assurance", d: "Site audits, material verification, and post-project checks." },
              ].map((item, idx) => (
                <motion.div className="col-md-6 col-lg-3" key={idx} variants={fadeUp}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h6 className="fw-semibold">{item.t}</h6>
                      <p className="mb-0 text-secondary">{item.d}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section className="py-5 bg-white">
          <div className="container">
            <motion.div
              className="row g-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {[
                { t: "Home Construction", d: "New homes, structural works, room additions." },
                { t: "Interior Design", d: "Partitions, wallpaper, false ceilings, lighting." },
                { t: "Plumbing Services", d: "Pipes, leak repair, bathroom fitting, tank service." },
                { t: "Electrical Work", d: "Wiring, socket repair, appliances, safety checks." },
                { t: "Furniture & Carpentry", d: "Wardrobes, kitchens, modular cabinets, repairs." },
                { t: "General Repairs", d: "Wall patching, doors/windows, installations, maintenance." },
              ].map((s, i) => (
                <motion.div className="col-md-6 col-lg-4" key={i} variants={fadeUp}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{s.t}</h5>
                      <p className="card-text text-secondary mb-0">{s.d}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-5">
          <div className="container">
            <h3 className="h4 text-center mb-4">What Our Customers Say</h3>
            <motion.div
              className="row g-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {[
                {
                  n: "Priya Sharma",
                  c: "Mumbai",
                  q: "Excellent service! The electrician arrived on time, was very professional, and the final work made a real difference.",
                },
                {
                  n: "Rajesh Kumar",
                  c: "Delhi",
                  q: "Great experience! Got my kitchen upgraded. Workers were skilled, punctual, and quality exceeded expectations.",
                },
                {
                  n: "Anjali Patel",
                  c: "Pune",
                  q: "Finally, a reliable service. The plumber diagnosed and fixed the issue quickly. Great follow-up too.",
                },
              ].map((t, i) => (
                <motion.div className="col-md-4" key={i} variants={fadeUp}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="rounded-circle bg-warning" style={{ width: 40, height: 40 }} />
                        <div>
                          <div className="fw-semibold">{t.n}</div>
                          <div className="text-secondary small">{t.c}</div>
                        </div>
                      </div>
                      <p className="mb-0 text-secondary">{t.q}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team */}
        <section className="py-5 bg-white">
          <div className="container">
            <h3 className="h4 text-center mb-4">Meet Our Leadership Team</h3>
            <motion.div
              className="row g-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {[
                { n: "Vaibhav", r: "CO-Founder", },
                { n: "Uttej", r: "CO-Founder" }
              ].map((m, i) => (
                <motion.div className="col-sm-6 col-lg-3" key={i} variants={fadeUp}>
                  <div className="card h-100 border-0 shadow-sm text-center p-4">

                    <div className="d-flex justify-content-center">
                      <img
                        src={m.i || "https://via.placeholder.com/300"}
                        alt="Team"
                        style={{
                          width: "220px",
                          height: "220px",
                          objectFit: "cover",
                          border: "1px solid #f8f9fa",
                          borderRadius: "50%"
                        }}
                        className="mx-auto"
                      />
                    </div>


                    {/* Card Body */}
                    <div className="card-body mt-3">
                      <h6 className="fw-semibold mb-1">{m.n}</h6>
                      <div className="text-secondary small mb-2">{m.r}</div>
                      <p className="mb-0 text-secondary">{m.d}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

            </motion.div>
          </div>
        </section>

        {/* Closing */}
        <section className="py-5">
          <div className="container">
            <motion.div
              className="row align-items-center g-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              <motion.div className="col-lg-7" variants={fadeUp}>
                <h2 className="h3 fw-bold">Apna Mestri Promise</h2>
                <p className="text-secondary mb-2">
                  Simple booking, verified workers, fair pricing, and quality materials—from small fixes to big builds.
                </p>
                <p className="mb-0">
                  We’re here to build not just homes, but trust and happiness—one project at a time.
                </p>
              </motion.div>
              <motion.div className="col-lg-5 text-center" variants={fadeUp}>
                <img src="/about3.jpeg" alt="Work montage" className="img-fluid rounded-3 shadow-sm" />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer></Footer>
    </>
  );
}
