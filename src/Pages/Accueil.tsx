import { Container, Row, Col } from "react-bootstrap";
import { ProductList } from "../components/ListProduct";
import "../assets/styles/Accueil.css"; // ajoute un fichier CSS dédié

export const Accueil = () => {
  return (
    <>
      <div className="hero-section">
        <Container>
            <Row className="justify-content-center align-items-center">
              <Col xs={12}>
                <h1 className="hero-title">BRING YOUR IDEAS TO LIFE</h1>
              </Col>
              <Col xs={12}>
                <p className="hero-subtitle">High-quality 3D printed figurines</p>
              </Col>
              <Col xs={12}>
                <button type="button" className="hero-button btn btn-light">SHOP NOW</button>
              </Col>
            </Row>
        </Container>
      </div>

      <div style={{ marginTop: "auto" }}>
        <ProductList />
      </div>
    </>
  );
};
