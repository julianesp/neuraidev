import React, { useState } from 'react';
import { Button, Form, Dropdown, InputGroup } from 'react-bootstrap';
import { FaWhatsapp } from 'react-icons/fa';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    product: '',
    urgency: '',
    budget: '',
  });

  const [show, setShow] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construir el mensaje para WhatsApp
    const message = `¡Hola! Tengo una consulta sobre tu producto:

Producto: ${formData.product}
Urgencia: ${formData.urgency}
Presupuesto aproximado: ${formData.budget}`;
    
    // Abrir WhatsApp con el mensaje pre-escrito
    const whatsappUrl = `https://wa.me/573174503604?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="contact-form-container">
      <h3 className="text-center mb-4">¡Contáctanos por WhatsApp!</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="product">
          <Form.Label>¿Qué producto te interesa?</Form.Label>
          <Dropdown onSelect={(e) => setFormData(prev => ({ ...prev, product: e }))}>
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
              {formData.product || 'Selecciona un producto'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="celulares">Celulares</Dropdown.Item>
              <Dropdown.Item eventKey="computadoras">Computadoras</Dropdown.Item>
              <Dropdown.Item eventKey="accesorios">Accesorios</Dropdown.Item>
              <Dropdown.Item eventKey="damas">Ropa Damas</Dropdown.Item>
              <Dropdown.Item eventKey="otros">Otros productos</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>

        <Form.Group controlId="urgency" className="mt-3">
          <Form.Label>¿Cuándo lo necesitas?</Form.Label>
          <Form.Select
            name="urgencia"
            value={formData.urgency}
            onChange={handleInputChange}
          >
            <option value="">Selecciona una opción</option>
            <option value="urgente">Urgente (24-48 horas)</option>
            <option value="semanal">Esta semana</option>
            <option value="flexible">Flexible (2-3 semanas)</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="budget" className="mt-3">
          <Form.Label>Presupuesto aproximado</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="Ejemplo: 50000"
            />
          </InputGroup>
        </Form.Group>

        <Button 
          variant="primary" 
          type="submit" 
          className="mt-3 w-100"
          disabled={!formData.product || !formData.urgency || !formData.budget}
        >
          <FaWhatsapp className="me-2" /> Contactar por WhatsApp
        </Button>
      </Form>
    </div>
  );
};

export default ContactForm;
