// src/Pages/Accueil.tsx
import { Container, Row, Col } from "react-bootstrap";
import { ProductList } from "../components/ListProduct";

export const Accueil = () => {
  return (
    <>
      <div
        style={{
          height: "calc(100vh - 60px)", 
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
        </Container>
      </div>

      
      <div style={{ marginTop: "auto" }}>
        <ProductList/>
      </div>
    </>
  );
};