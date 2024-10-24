import Image from "next/image";
import React from "react";

const AccessoryCard = ({ imageUrl, name, description, price }) => {
  return (
    <div className="accessory-container">
      <div className="image-section">
        <Image src={imageUrl} alt={name} width={150} height={150}/>
      </div>
      <div className="info-section">
        <h2 className="accessory-title">{name}</h2>
        <p className="accessory-description">{description}</p>
        <p className="accessory-price">${price}</p>
        <button className="buy-button">Agregar al Carrito</button>
      </div>
    </div>
  );
};

export default AccessoryCard;
