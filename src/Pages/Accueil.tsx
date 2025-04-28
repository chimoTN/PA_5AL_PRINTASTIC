// src/Pages/Accueil.tsx
import { Container, Row, Col } from "react-bootstrap";

export const Accueil = () => {
  return (
    <div
      style={{
        height: "calc(100vh - 60px)", // Ajustez en fonction de la hauteur de votre Navbar
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "linear-gradient(180deg,rgba(10, 25, 47, 0.9), rgba(128, 0, 128, 0.6), rgba(255, 0, 0, 0.6))",
        backdropFilter: "blur(100px)",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12}>
            <h1 style={{ color: "white", fontWeight: "bold" }}>Bienvenue sur PRINTASTIC</h1>
          </Col>
        </Row>
        <Row className="justify-content-center mt-3">
          <Col xs={12}>
            <p style={{ color: "white", fontSize: "1.2rem" }}>On arrive bientôt...</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};