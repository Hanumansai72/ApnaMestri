import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const allCategories = {
  Materials: [
    { name: "Cement", desc: "Portland, white, RMC", icon: "bi-box", tags: ["strong", "bulk", "bagged"], count: "1.2k+" },
    { name: "Steel", desc: "TMT bars, mesh", icon: "bi-gear-wide-connected", tags: ["rebar", "rod", "mesh"], count: "890+" },
    { name: "Plumbing", desc: "Pipes, valves", icon: "bi-pipe", tags: ["PVC", "CPVC", "HDPE"], count: "500+" },
    { name: "Electrical", desc: "Wires, switches", icon: "bi-lightbulb-fill", tags: ["wire", "LED", "panel"], count: "620+" },
    { name: "Paints", desc: "Primers, emulsions", icon: "bi-palette", tags: ["color", "weather", "shine"], count: "1.4k+" },
    { name: "Bricks", desc: "Clay, AAC blocks", icon: "bi-boxes", tags: ["solid", "eco", "burnt"], count: "2.1k+" },
    { name: "Sand", desc: "River, M-sand", icon: "bi-bezier", tags: ["filtered", "construction"], count: "300+" },
    { name: "Aggregates", desc: "10mm, 20mm", icon: "bi-stack", tags: ["coarse", "gravel", "crushed"], count: "430+" },
    { name: "Concrete", desc: "Ready Mix", icon: "bi-droplet", tags: ["mixed", "site-ready"], count: "390+" },
    { name: "Tiles", desc: "Floor, wall", icon: "bi-grid", tags: ["ceramic", "vitrified"], count: "770+" },
    { name: "Glass", desc: "Windows, panels", icon: "bi-window", tags: ["tempered", "toughened"], count: "550+" },
    { name: "Doors", desc: "Wood, metal", icon: "bi-door-closed", tags: ["main", "PVC"], count: "610+" },
    { name: "Windows", desc: "UPVC, aluminum", icon: "bi-windows", tags: ["sliding", "fixed"], count: "500+" },
    { name: "Roofing", desc: "Sheets, tiles", icon: "bi-house", tags: ["asbestos", "coloron"], count: "450+" },
    { name: "GroutsSealants", desc: "Dr. Fixit", icon: "bi-bucket", tags: ["waterproof", "seal"], count: "380+" },
    { name: "Lighting", desc: "LEDs, bulbs", icon: "bi-lightbulb", tags: ["indoor", "outdoor"], count: "960+" },
    { name: "Kitchen", desc: "Sinks, cabinets", icon: "bi-cup-straw", tags: ["modular", "gas"], count: "290+" },
    { name: "Wardrobe", desc: "Modular, sliding", icon: "bi-cabinet", tags: ["wood", "mirror"], count: "150+" },
    { name: "Wallpaper", desc: "Vinyl, texture", icon: "bi-card-image", tags: ["design", "easy"], count: "300+" },
    { name: "Curtains", desc: "Fabric, rods", icon: "bi-columns-gap", tags: ["cotton", "blackout"], count: "400+" },
    { name: "Furniture", desc: "Beds, sofas", icon: "bi-sofa", tags: ["wooden", "modular"], count: "890+" },
    { name: "BathroomFittings", desc: "Taps, showers", icon: "bi-droplet-half", tags: ["modern", "SS"], count: "680+" },
    { name: "FalseCeiling", desc: "POP, grid", icon: "bi-layers", tags: ["ceiling", "design"], count: "470+" },
    { name: "Flooring", desc: "Marble, vinyl", icon: "bi-border-style", tags: ["granite", "wood"], count: "860+" },
    { name: "ModularFurniture", desc: "Chairs, tables", icon: "bi-layout-text-window-reverse", tags: ["setup", "office"], count: "510+" },
    { name: "DecorativePanels", desc: "Wall décor", icon: "bi-puzzle", tags: ["textured", "wood"], count: "210+" },
    { name: "SmartHome", desc: "Automation", icon: "bi-house-gear", tags: ["IoT", "Alexa"], count: "130+" },
  ],
  Services: [
    { name: "Architects", desc: "Design, plans", icon: "bi-rulers", tags: ["modern", "licensed"], count: "520+" },
    { name: "Civil Engineer", desc: "Structure, site", icon: "bi-diagram-3", tags: ["planning"], count: "710+" },
    { name: "Site Supervisor", desc: "Manage daily", icon: "bi-person-check", tags: ["reporting"], count: "600+" },
    { name: "Survey Engineer", desc: "Level, maps", icon: "bi-geo", tags: ["topo", "total"], count: "300+" },
    { name: "MEP Consultant", desc: "MEP layouts", icon: "bi-building-gear", tags: ["fire", "duct"], count: "220+" },
    { name: "Structural Engineer", desc: "Load, safety", icon: "bi-diagram-2", tags: ["design"], count: "180+" },
    { name: "Project Manager", desc: "Control, cost", icon: "bi-clipboard-data", tags: ["timeline"], count: "410+" },
    { name: "HVAC Engineer", desc: "Cooling, duct", icon: "bi-wind", tags: ["chillers"], count: "280+" },
    { name: "Safety Engineer", desc: "PPE, audits", icon: "bi-shield-check", tags: ["site"], count: "170+" },
    { name: "Contractor", desc: "Execute work", icon: "bi-person-badge", tags: ["team"], count: "980+" },
    { name: "Interior Designer", desc: "Decorate", icon: "bi-brush", tags: ["theme"], count: "300+" },
    { name: "WaterProofing Consultant", desc: "Basement, roof", icon: "bi-droplet-fill", tags: ["chemicals"], count: "210+" },
    { name: "Acoustic Consultants", desc: "Soundproofing", icon: "bi-soundwave", tags: ["studio"], count: "90+" },
    { name: "EarthWork Labour", desc: "Digging", icon: "bi-truck", tags: ["manual"], count: "340+" },
    { name: "Civil Mason", desc: "Plaster, walls", icon: "bi-tools", tags: ["brickwork"], count: "670+" },
    { name: "Shuttering/Centring Labour", desc: "Formwork", icon: "bi-grid-1x2", tags: ["setup"], count: "300+" },
    { name: "Plumber", desc: "Taps, fittings", icon: "bi-wrench-adjustable", tags: ["PVC"], count: "750+" },
    { name: "Electrician", desc: "Wiring", icon: "bi-plug", tags: ["safe", "panel"], count: "820+" },
    { name: "Painter", desc: "Interior, exterior", icon: "bi-paint-bucket", tags: ["emulsion"], count: "580+" },
    { name: "Carpenter", desc: "Wood work", icon: "bi-hammer", tags: ["custom"], count: "690+" },
    { name: "Flooring Labour", desc: "Tile/marble", icon: "bi-border-width", tags: ["laying"], count: "350+" },
    { name: "False Ceiling Worker", desc: "Grid/POP", icon: "bi-columns", tags: ["gypsum"], count: "260+" },
  ],
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const CategoryDashboard = () => {
  const [activeTab, setActiveTab] = useState("Materials");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredCategories = allCategories[activeTab].filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "#fff", color: "#000", minHeight: "100vh", paddingBottom: "50px", overflowX: "hidden" }}>
      <Container className="py-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 style={{ color: "#FFD700", fontWeight: "bold", textAlign: "center" }}>
            Civil Categories
          </h1>
          <p style={{ textAlign: "center", color: "#555", fontSize: "1rem", marginBottom: "30px" }}>
            Find the perfect civil engineering service or construction material for your project
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "40px", flexWrap: "wrap" }}
        >
          <Form.Control
            style={{
              width: "300px",
              borderRadius: "30px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #ccc",
              color: "#000",
            }}
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ background: "#f8f9fa", borderRadius: "30px", display: "flex", overflow: "hidden" }}>
            {["Services", "Materials"].map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  borderRadius: "0",
                  background: activeTab === tab
                    ? "linear-gradient(to right, #FFD700, #FFC107)"
                    : "transparent",
                  color: activeTab === tab ? "#000" : "#555",
                  border: "none",
                  padding: "8px 20px",
                }}
              >
                {tab}
              </Button>
            ))}
          </div>
        </motion.div>

        <Row>
          <AnimatePresence>
            {filteredCategories.map((cat) => (
              <Col key={cat.name} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  whileHover={{ y: -5, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "15px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    height: "100%",
                    position: "relative",
                    border: "1px solid #eee",
                  }}
                >
                  <div style={{
                    background: "linear-gradient(to bottom, #FFD700, #FFC107)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10px",
                  }}>
                    <i className={`bi ${cat.icon}`} style={{ color: "#000", fontSize: "18px" }}></i>
                  </div>
                  <h5 style={{ color: "#000" }}>{cat.name}</h5>
                  <p style={{ color: "#555", fontSize: "0.85rem", minHeight: '3em' }}>{cat.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
                    {cat.tags.map((tag, i) => (
                      <span key={i} style={{
                        background: "#f0f0f0",
                        color: "#555",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                      }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#555" }}>
                    {cat.rating && <span><i className="bi bi-star-fill text-warning"></i> {cat.rating}</span>}
                    <span>{cat.count}</span>
                  </div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      className="w-100 mt-3"
                      style={{
                        background: "linear-gradient(to right, #FFD700, #FFC107)",
                        border: "none",
                        color: "#000",
                        fontWeight: "bold"
                      }}
                      onClick={() =>
                        navigate(`/${activeTab === "Materials" ? "product" : "service"}?search=${encodeURIComponent(cat.name)}`)
                      }
                    >
                      {activeTab === "Materials" ? "Order Now" : "Hire Now"}
                    </Button>
                  </motion.div>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      </Container>
    </div>
  );
};

export default CategoryDashboard;
